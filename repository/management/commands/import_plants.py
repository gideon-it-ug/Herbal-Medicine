import os
from pathlib import Path
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
import openpyxl

from repository.models import Plant


class Command(BaseCommand):
    help = "Import plants from MEDICINAL PLANTS/plant_names.xlsx into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--excel-path",
            type=str,
            default=None,
            help="Optional override path to the xlsx file",
        )
        parser.add_argument(
            "--images-dir",
            type=str,
            default=None,
            help="Optional override path to the Images folder",
        )

    def handle(self, *args, **options):
        base_dir = Path(settings.BASE_DIR)

        # MEDICINAL PLANTS sits one level above the Django project root
        # (repo_root/MEDICINAL PLANTS vs repo_root/herbal_medicine/...)
        default_excel = base_dir.parent / "MEDICINAL PLANTS" / "plant_names.xlsx"
        default_images = base_dir.parent / "MEDICINAL PLANTS" / "Images"

        excel_path = Path(options["excel_path"]) if options["excel_path"] else default_excel
        images_dir = Path(options["images_dir"]) if options["images_dir"] else default_images

        if not excel_path.exists():
            self.stderr.write(self.style.ERROR(f"Excel file not found at: {excel_path}"))
            return

        self.stdout.write(f"Reading: {excel_path}")
        self.stdout.write(f"Images folder: {images_dir} (exists: {images_dir.exists()})")

        image_lookup = {}
        if images_dir.exists():
            for f in images_dir.iterdir():
                if f.is_file():
                    key = self._normalize(f.stem)
                    image_lookup[key] = f

        wb = openpyxl.load_workbook(excel_path, data_only=True)
        sheet = wb.active

        created_count = 0
        updated_count = 0
        skipped_count = 0

        rows = list(sheet.iter_rows(min_row=2, values_only=True))
        for row in rows:
            if not row or not row[0]:
                skipped_count += 1
                continue

            english_name = str(row[0]).strip()
            scientific_name = str(row[1]).strip() if len(row) > 1 and row[1] else ""
            nature = str(row[2]).strip() if len(row) > 2 and row[2] else ""

            if not english_name:
                skipped_count += 1
                continue

            plant, was_created = Plant.objects.get_or_create(
                name=english_name,
                defaults={
                    "scientific_name": scientific_name,
                    "disease_cured": "Not yet documented",
                    "preparation_method": "Not yet documented",
                    "dosage": "Not yet documented",
                    "cultivation_notes": f"Plant type: {nature}" if nature else "",
                    "approval_status": "approved",
                },
            )

            if not was_created:
                plant.scientific_name = scientific_name or plant.scientific_name
                if nature and "Plant type:" not in (plant.cultivation_notes or ""):
                    plant.cultivation_notes = f"Plant type: {nature}"
                if plant.approval_status != "approved":
                    plant.approval_status = "approved"
                updated_count += 1
            else:
                created_count += 1

            if not plant.image:
                match = image_lookup.get(self._normalize(english_name))
                if match:
                    with open(match, "rb") as img_file:
                        plant.image.save(match.name, File(img_file), save=False)

            plant.save()

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created: {created_count}, Updated: {updated_count}, Skipped: {skipped_count}"
        ))

    @staticmethod
    def _normalize(text):
        return "".join(ch.lower() for ch in text if ch.isalnum())