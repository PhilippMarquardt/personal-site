# MMWrapper

This project is similar to my VisualDL project. However, this time it has a more production-level approach in mind.

Everything is still defined in a YAML file (or just passable as a dict in Python). Since the backend of this project is powered by the OpenMMLab environment, it has a wide variety of different models available. This makes it very easy to use, for example, MMDetection, which is quite hard to get started with if you have never worked with it before. I made several settings such as the backend, which can be ("cv2" | "tifffile"). The tifffile backend can be used if you have a multi-channel image (such as those used in fluorescence microscopy). The rest of the settings are quite self-explanatory, so there's not much to say.


```yaml
model_name : "maskrcnn_r50" #CHANGE THIS
checkpoint_interval : 1
keep_checkpoints : 1
num_classes : 3
in_channels : 3
backend: "cv2"
num_epochs : 300 #change
image_size : !!python/tuple [512, 512] #CHANGE THIS
val_interval : 1
resume : None
work_dir : "test" #change
load_from : "https://download.openmmlab.com/mmdetection/v2.0/mask_rcnn/mask_rcnn_r50_fpn_mstrain-poly_3x_coco/mask_rcnn_r50_fpn_mstrain-poly_3x_coco_20210524_201154-21b550bb.pth"
batch_size : 2
pretrained : True
persistent_workers : False
num_workers : 0
classes : !!python/tuple ["Dr\u00fcsengewebe gesund","Adenom", "Karzinom", "3", "4"]
dataroot : "dataset/" #change
train_ann_file : "train.json"
train_img_prefix:
  img: images/ #CHANGE THIS
  seg: annotations/panoptic_train2017/

val_ann_file : "valid.json"
val_img_prefix:
  img: images/  #CHANGE THIS
  seg: annotations/panoptic_val2017/

test_ann_file : "valid.json"
test_img_prefix:
  img: images/ #CHANGE THIS
  seg: annotations/panoptic_val2017/
```
## Start Training
With the defined config we can simply import the get_runner function from the mmwrapper api and pass in the config file. The returned runner has a train function to start the training.
```python
def get_runner(config_file):
    if isinstance(config_file, dict):
        settings = config_file
    else:
        with open(config_file) as f:
            settings = yaml.load(f, Loader=yaml.FullLoader)

    cfg = ConfigModifierRegistry.config_modifiers[settings["model_name"]](settings)
    runner = Runner.from_cfg(cfg)
    return runner
```

## Inference
After the model is trained, doing inference is easy as you can import the InferenceModel from the mmwrapper api and call predict with your images:

```python
class InferenceModel:
    def __init__(self, checkpoint_file, config_file, device="cuda"):

        mmpretrainreload(True)
        mmdetreload(True)
        # mmsegreload(True)
        self.is_detection = (
            Config.fromfile(config_file)["train_pipeline"][-1]["type"]
            == "PackDetInputs"
        )

        self.is_classification = (
            Config.fromfile(config_file)["default_scope"] == "mmpretrain"
        )
        if self.is_classification:
            self.model = ImageClassificationInferencer(
                config_file, pretrained=checkpoint_file, device=device
            )
            self.forward = self.model
            return
        if self.is_detection:
            self.model = init_detector(config_file, checkpoint_file, device=device)
            self.forward = inference_detector
        else:
            self.model = init_model(config_file, checkpoint_file, device=device)
            self.forward = inference_model

    def predict(self, imgs):
        if self.is_classification:
            return self.model(imgs)
        return self.forward(self.model, imgs)
```