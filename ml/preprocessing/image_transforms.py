import torchvision.transforms as transforms
from PIL import Image

def get_image_transforms(is_train: bool = False):
    """
    Returns torchvision transforms for ResNet preprocessing.
    Images are scaled and normalized using standard ImageNet mean and std.
    """
    if is_train:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

def preprocess_pil_image(image: Image.Image):
    """Preprocess a single PIL Image for model inference."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    transform = get_image_transforms(is_train=False)
    return transform(image)
