# VisualDL

This started off as a project that allows me to quickly specify different model architectures that should be applied to a given dataset.

The goal was to make, firstly, classification and segmentation models easily trainable. To train a model, the only thing to do is have a dataset in the common formats for the model types (folder with class names for classification, (images, labels) pairs for segmentation, instance segmentation, and object detection). The only uncommon thing is that instance segmentation models are also trained with a semantic segmentation dataset. This is due to the fact that for the application I had, I only had segmentation datasets available, and by being able to train every model type with the same dataset, it becomes very easy to use.

But back to the config: we only have to define the model type, the train, valid, and test folders, and a list of weights. The models can also be a list of models, and the backend used for the model initialization is a mix of PyTorch Image Models, Segmentation Models PyTorch, and custom models. All hyperparameters can be defined in the settings. For the transforms, basically any transform defined in Albumentations can be used, so the list in my example below is not comprehensive.


```yaml
type: "segmentation"

data:
  train: "C:/Users/phili/Downloads/Telegram Desktop/dataset (4)/dataset/train"
  valid: "C:/Users/phili/Downloads/Telegram Desktop/dataset (4)/dataset/valid"
  test: "C:/Users/phili/Downloads/Telegram Desktop/dataset (4)/dataset/valid"
  weights: ["None"]

  save_folder: "" 

# anchors
models:
  - backbone: "tu-resnest50d"
    decoder: "Unet"

settings:
  nc: 2
  in_channels: 4
  epochs: 3000
  optimizer: "AdamW"
  lr: 1e-4
  workers: 0
  batch_size: [16]
  max_image_size: 512 #must be set for transformer based models because of the positional embedding
  scales: "None" #or None
  use_attention: False
  ignore_index : -100
  gradient_accumulation: 16
  criterions: #criterions defined in segmentation_models_pytorch.utils.losses can be used
    - "DiceLoss"
    - "CrossEntropyLoss"
    #- "DiceLoss"

  tensorboard_log_dir: "tensorboard_log"
  metrics:
    - name: "Accuracy"
      params: "num_classes=2"
    - name: "IoU"
      params: "num_classes=2"
  monitor_metric_name: "IoU"
  monitor_metric_params: "num_classes=2"
  class_weights: False
  calculate_weight_map: False
  calculate_distance_maps: False
  add_object_detection_model: False
  early_stopping: 500
  
transforms:
  Resize: width = 128, height = 128
  HorizontalFlip: p=0.25
  VerticalFlip: p=0.25
  RandomBrightnessContrast: p=0.15
  RGBShift: p=0.0
  RandomShadow : p=0.00
  GaussianBlur: p=0.0
  Transpose: p=0.15
  RandomRotate90: p=0.15
  Perspective: p=0.00
  Affine: p=0.15
  ToGray: p=0.0
  RandomScale: p=0.0
```
## Start Training
After defining the config the training can be started in just 2 lines of code:
```python
from visualdl import vdl
vdl.train("visualdl/trainer/segmentation/segmentation.yaml")
```

This will train all models defined and also test all permutations of possible ensambles to find the best possible model combination.

## Inference
After the model is trained, doing inference with this model is just as easy as the training:

```python
from visualdl import vdl
import cv2
model = vdl.get_inference_model("path_to_your_train_file.pt")
image = cv2.imread("your_image.png")[::-1] #must be provided in rgb
predictions = model.predict([image]) #returns a list with the prediction for each provided image
```