import graphene
from .models import Card
from graphene_django.types import DjangoObjectType
from django.utils import timezone

class CardType(DjangoObjectType):
    class Meta:
        model = Card
        fields = '__all__'

class CreateCard(graphene.Mutation):
    card = graphene.Field(CardType)

    class Arguments:
        title = graphene.String()
        description = graphene.String()
        column = graphene.String()

    def mutate(self, info, title, description, column):
        card = Card(title=title, description=description, column=column)
        card.save()
        return CreateCard(card=card)

class UpdateCard(graphene.Mutation):
    card = graphene.Field(CardType)

    class Arguments:
        id = graphene.ID()
        title = graphene.String()
        description = graphene.String()
        column = graphene.String()

    def mutate(self, info, id, title, description, column):
        card = Card.objects.get(pk=id)
        card.title = title
        card.description = description
        card.column = column
        card.changed = timezone.now() #updating changed time
        card.save()
        return UpdateCard(card=card)

class DeleteCard(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        id = graphene.ID()

    def mutate(self, info, id):
        card = Card.objects.get(pk=id)
        card.delete()
        return DeleteCard(success=True)

class Query(graphene.ObjectType):
    all_cards = graphene.List(CardType)

    def resolve_all_cards(self, info):
        return Card.objects.all()

class Mutation(graphene.ObjectType):
    create_card = CreateCard.Field()
    update_card = UpdateCard.Field()
    delete_card = DeleteCard.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
