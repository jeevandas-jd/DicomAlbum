# Generated by Django 5.2 on 2025-04-15 17:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("dimod_api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="dicomfile",
            name="filename",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
