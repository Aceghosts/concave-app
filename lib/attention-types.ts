// Shared Phase E contract — see CONCAVE2-FUNCTIONAL-SPEC.md §Phase E.
// Owned by the saliency agent; the analyze route consumes `attention_metrics` from intake.

export type AttentionRegion = {
  label: string;
  share: number; /* 0-1 of total predicted attention */
  box: [number, number, number, number]; /* x, y, w, h — fractions 0-1 of the image */
};

export type AttentionMetrics = {
  source: 'msi-net';            // model id — label in UI as "predicted attention (SALICON-benchmark model)"
  heatmap_data_url: string;     // PNG overlay, same aspect as the input image, alpha-blended jet colormap
  regions: AttentionRegion[];   // OCR'd text blocks + any detected logo region, each with attention share
  text_attention_share: number; // 0-1, total share on OCR text
  top_focus: string;            // one-line plain-English: where attention concentrates
  /**
   * Extension beyond the shared contract (optional, ignored by the prompt side):
   * downscaled original image so the report can render the overlay toggle after
   * the uploaded File object is gone. JPEG data URL, max 800px wide.
   */
  image_data_url?: string;
};
