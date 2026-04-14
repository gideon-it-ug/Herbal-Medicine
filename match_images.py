import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'herbal_medicine.settings')
django.setup()

from repository.models import Plant

images_folder = 'media/plants'
matched = 0
unmatched = 0

for plant in Plant.objects.all():
    # Try to find matching image
    for filename in os.listdir(images_folder):
        name_without_ext = os.path.splitext(filename)[0].lower()
        plant_name_lower = plant.name.lower()
        
        if plant_name_lower in name_without_ext or name_without_ext in plant_name_lower:
            plant.image = f'plants/{filename}'
            plant.save()
            matched += 1
            break
    else:
        unmatched += 1

print(f"Done! {matched} plants matched with images, {unmatched} without images.")