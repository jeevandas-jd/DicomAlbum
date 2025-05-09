# Generated by Django 5.2 on 2025-04-25 17:06

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("dimod_api", "0002_dicomfile_filename"),
    ]

    operations = [
        migrations.AddField(
            model_name="album",
            name="dicom_files",
            field=models.ManyToManyField(
                blank=True, related_name="albums", to="dimod_api.dicomfile"
            ),
        ),
    ]
