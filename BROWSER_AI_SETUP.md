# Browser AI

Waste scans run directly in the browser with Transformers.js and the quantized `Xenova/convnext-tiny-224` image-classification model. Images are not sent to Supabase or an inference API, so scans do not use Hugging Face Inference Providers credits and do not need a Supabase Edge Function.

On the first scan, the browser downloads the Transformers.js runtime and approximately 29 MB of quantized model weights from public CDNs. The browser caches model files for later use. Internet access is needed for the initial download; classification runs on the user's device afterward.

## Model limitations

ConvNeXt Tiny is pretrained on ImageNet-1k, not a waste-sorting dataset. It can recognize common objects but may not identify waste material or disposal categories accurately. EcoScan's disposal guidance is an estimate and should be checked against local rules.

The page runs inference with WebAssembly on the device CPU. Performance depends on the device. The model is loaded only after the user starts the first scan.
