import csv, django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'herbal_medicine.settings')
django.setup()
from repository.models import Plant

with open('responses.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        Plant.objects.create(
            name=row['Name of plant'],
            scientific_name=row['Scientific name'],
            local_language=row['Local Language'],
            geographic_distribution=row['Geographic distribution'],
            ailments_treated=row['Ailments treated'],
            preparation_method=row['Preparation method '],
            dosage=row['Dosage'],
        )
    print('Import complete!')