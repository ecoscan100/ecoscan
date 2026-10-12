# Browser AI

Waste scans run in the browser using Transformers.js and the quantized `Xenova/convnext-tiny-224` image-classification model. Inference happens on the user's device; scan images are not sent to an AI server. The browser downloads the model on the first scan and stores its files in the Transformers.js Cache API cache.

On the scan page, choose **Keep AI on this device** to retain the cached model for faster future scans, or **Delete saved AI** to remove the Transformers.js model cache immediately. The model will be downloaded again if another scan is started after deletion.

## Model limitations

ConvNeXt Tiny is pretrained on ImageNet-1k, not a waste-sorting dataset. It can recognize common objects but may not identify waste material or disposal categories accurately. EcoScan's disposal guidance is an estimate and should be checked against local rules.

The page runs inference with WebAssembly on the device CPU. Performance depends on the device. The model is loaded only after the user starts a scan.
