import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'herbal_medicine.settings')
django.setup()

from repository.models import Plant
import openpyxl

wb = openpyxl.load_workbook('MEDICINAL PLANTS/plant_names.xlsx')
ws = wb.active

count = 0
skipped = 0

for row in ws.iter_rows(min_row=2, values_only=True):
    english_name = row[0]
    scientific_name = row[1]
    nature = row[2]

    if not english_name:
        continue

    # Skip if plant already exists
    if Plant.objects.filter(name=english_name).exists():
        skipped += 1
        continue

    Plant.objects.create(
        name=english_name,
        scientific_name=scientific_name or '',
        cultivation_notes=f"Nature: {nature}" if nature else '',
    )
    count += 1

print(f"Import complete! {count} plants added, {skipped} skipped.")