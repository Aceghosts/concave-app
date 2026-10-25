// PPTX export — slide order mirrors the Prove tab:
// Title → Executive summary + recommendations → Score grid → one slide per driver → Methodology/close.
import { DRIVER_KEYS, DRIVER_LABELS, type Report } from './types';
import { METHODOLOGY_NOTE } from './ProveTab';

export async function generatePPTX(report: Report) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE';

  const BG = '0A0F1E';
  const ACC = '3EB489';
  const WHITE = 'F1F5F9';
  const MUTED = '5E7A8F';

  const label = (key: string) => (DRIVER_LABELS[key] ?? key).toUpperCase();

  // ── Slide 1: Cover ──────────────────────────────────────────────
  const s1 = prs.addSlide();
  s1.background = { color: BG };
  s1.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s1.addText('CONCAVE', { x: 0.4, y: 0.5, w: 12, h: 0.8, fontSize: 14, fontFace: 'Arial Narrow', bold: true, color: ACC, charSpacing: 6 });
  s1.addText('CAMPAIGN\nREPORT', { x: 0.4, y: 1.4, w: 9, h: 2.6, fontSize: 72, fontFace: 'Arial Narrow', bold: true, color: WHITE, lineSpacingMultiple: 0.85 });
  s1.addText(report.campaignName || 'Campaign Analysis', { x: 0.4, y: 4.2, w: 9, h: 0.4, fontSize: 16, fontFace: 'Calibri', color: MUTED });
  s1.addText(`Concave Score`, { x: 0.4, y: 5.2, w: 3, h: 0.35, fontSize: 11, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 3 });
  s1.addText(`${Math.round(report.overall_score * 10)}/100`, { x: 0.4, y: 5.6, w: 5, h: 1.2, fontSize: 80, fontFace: 'Arial Narrow', bold: true, color: ACC });

  // ── Slide 2: Executive Summary ───────────────────────────────────
  const s2 = prs.addSlide();
  s2.background = { color: BG };
  s2.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s2.addText('EXECUTIVE SUMMARY', { x: 0.4, y: 0.4, w: 12, h: 0.5, fontSize: 28, fontFace: 'Arial Narrow', bold: true, color: WHITE, charSpacing: 3 });
  s2.addText(report.verdict, { x: 0.4, y: 1.2, w: 12.2, h: 1.6, fontSize: 13, fontFace: 'Calibri', color: 'A8BCCF', lineSpacingMultiple: 1.4 });
  s2.addText('TOP RECOMMENDATIONS', { x: 0.4, y: 3.0, w: 12, h: 0.35, fontSize: 10, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 3 });
  report.top_recommendations.forEach((rec: string, i: number) => {
    s2.addShape(prs.ShapeType.ellipse, { x: 0.4, y: 3.55 + i * 0.75, w: 0.28, h: 0.28, fill: { color: ACC } });
    s2.addText(`${i + 1}`, { x: 0.4, y: 3.53 + i * 0.75, w: 0.28, h: 0.28, fontSize: 9, fontFace: 'Calibri', bold: true, color: '000000', align: 'center', valign: 'middle' });
    s2.addText(rec, { x: 0.8, y: 3.52 + i * 0.75, w: 11.8, h: 0.5, fontSize: 13, fontFace: 'Calibri', color: WHITE });
  });

  // ── Slide 3: Score Grid ──────────────────────────────────────────
  const s3 = prs.addSlide();
  s3.background = { color: BG };
  s3.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s3.addText('DRIVER SCORES', { x: 0.4, y: 0.4, w: 12, h: 0.5, fontSize: 28, fontFace: 'Arial Narrow', bold: true, color: WHITE, charSpacing: 3 });

  const cols = 3;
  DRIVER_KEYS.forEach((key, idx) => {
    const driver = report.drivers[key];
    if (!driver) return;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 0.4 + col * 4.3;
    const y = 1.2 + row * 2.8;
    const s100 = Math.round(driver.score * 10);
    const c = s100 >= 70 ? ACC : s100 >= 40 ? 'F59E0B' : 'EF4444';

    s3.addShape(prs.ShapeType.rect, { x, y, w: 4.0, h: 2.4, fill: { color: '0D1320' }, line: { color: c, width: 1.5 } });
    s3.addShape(prs.ShapeType.rect, { x, y, w: 0.05, h: 2.4, fill: { color: c } });
    s3.addText(label(key), { x: x + 0.15, y: y + 0.18, w: 3.7, h: 0.3, fontSize: 8, fontFace: 'Calibri', bold: true, color: c, charSpacing: 2 });
    s3.addText(`${s100}`, { x: x + 0.15, y: y + 0.5, w: 2, h: 0.9, fontSize: 52, fontFace: 'Arial Narrow', bold: true, color: c });
    s3.addText('/100', { x: x + 1.5, y: y + 1.1, w: 1, h: 0.35, fontSize: 14, fontFace: 'Calibri', color: MUTED });
    s3.addText(driver.summary, { x: x + 0.15, y: y + 1.55, w: 3.7, h: 0.7, fontSize: 9, fontFace: 'Calibri', color: MUTED, lineSpacingMultiple: 1.3 });
  });

  // ── Slides 4–9: One per driver ───────────────────────────────────
  DRIVER_KEYS.forEach((key) => {
    const driver = report.drivers[key];
    if (!driver) return;
    const s100 = Math.round(driver.score * 10);
    const c = s100 >= 70 ? ACC : s100 >= 40 ? 'F59E0B' : 'EF4444';
    const sd = prs.addSlide();
    sd.background = { color: BG };
    sd.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: c } });
    sd.addText(label(key), { x: 0.4, y: 0.35, w: 10, h: 0.4, fontSize: 11, fontFace: 'Calibri', bold: true, color: c, charSpacing: 3 });
    sd.addText(`${s100}/100`, { x: 0.4, y: 0.8, w: 5, h: 1.1, fontSize: 64, fontFace: 'Arial Narrow', bold: true, color: c });
    sd.addText(driver.summary, { x: 0.4, y: 1.95, w: 12.2, h: 0.4, fontSize: 13, fontFace: 'Calibri', italic: true, color: MUTED });
    sd.addText(driver.deep_analysis || driver.justification || '', { x: 0.4, y: 2.5, w: 12.2, h: 1.4, fontSize: 12, fontFace: 'Calibri', color: 'A8BCCF', lineSpacingMultiple: 1.4 });

    sd.addText('WHAT WORKS', { x: 0.4, y: 4.05, w: 6, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 2 });
    (driver.what_works || []).forEach((w: string, i: number) => {
      sd.addText(`✓  ${w}`, { x: 0.4, y: 4.45 + i * 0.38, w: 5.8, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });
    sd.addText("WHAT DOESN'T", { x: 6.8, y: 4.05, w: 6, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: 'EF4444', charSpacing: 2 });
    (driver.what_doesnt || []).forEach((w: string, i: number) => {
      sd.addText(`✗  ${w}`, { x: 6.8, y: 4.45 + i * 0.38, w: 5.8, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });

    sd.addText('RECOMMENDATIONS', { x: 0.4, y: 5.9, w: 12, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 2 });
    (driver.recommendations || []).forEach((r, i: number) => {
      const text = typeof r === 'string' ? r : `[${r.priority}] ${r.action}`;
      sd.addText(`→  ${text}`, { x: 0.4, y: 6.28 + i * 0.38, w: 12.2, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });
  });

  // ── Closing slide: methodology note ──────────────────────────────
  const sEnd = prs.addSlide();
  sEnd.background = { color: BG };
  sEnd.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  sEnd.addText('CONCAVE', { x: 0.4, y: 0.5, w: 12, h: 0.6, fontSize: 14, fontFace: 'Arial Narrow', bold: true, color: ACC, charSpacing: 6 });
  sEnd.addText('PREPARED\nFOR YOU.', { x: 0.4, y: 1.8, w: 10, h: 3.0, fontSize: 72, fontFace: 'Arial Narrow', bold: true, color: WHITE, lineSpacingMultiple: 0.85 });
  sEnd.addText('HOW CONCAVE SCORES', { x: 0.4, y: 5.1, w: 10, h: 0.3, fontSize: 10, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 3 });
  sEnd.addText(METHODOLOGY_NOTE, { x: 0.4, y: 5.45, w: 12.2, h: 1.0, fontSize: 11, fontFace: 'Calibri', color: 'A8BCCF', lineSpacingMultiple: 1.4 });
  sEnd.addText('Campaign Analysis by Concave AI', { x: 0.4, y: 6.7, w: 10, h: 0.4, fontSize: 13, fontFace: 'Calibri', color: MUTED });

  await prs.writeFile({ fileName: 'Concave-Campaign-Report.pptx' });
}
