from django.db import models
from django.utils import timezone

class Card(models.Model):
    TODO = 'todo'
    IN_PROGRESS = 'in_progress'
    DONE = 'done'
    IN_REVIEW = 'in_review'

    COLUMN_CHOICES = [
        (TODO, 'To Do'),
        (IN_PROGRESS, 'In Progress'),
        (DONE, 'Done'),
        (IN_REVIEW, 'In Review'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    column = models.CharField(max_length=50, default="todo", choices=COLUMN_CHOICES)
    created = models.DateTimeField(
        verbose_name="creation date and time", auto_now_add=True,
    )
    changed = models.DateTimeField(
        verbose_name="last changed date and time", auto_now=True,
    )

    def __str__(self):
        return f"{self.title} - {self.column}"
