from datetime import datetime
import graphene
from graphene import ObjectType
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
import uuid
from backend.connections import dynamodb


table_name = "CardTable"
table = dynamodb.Table(table_name)

serializer = TypeSerializer()
deserializer = TypeDeserializer()


class CardType(graphene.ObjectType):
    id = graphene.String()
    title = graphene.String()
    description = graphene.String()
    column = graphene.String()
    created = graphene.DateTime()
    updated = graphene.DateTime()
    
    def resolve_created(self, info):
        created_value = self.get('created', None)

        if created_value:
            return datetime.strptime(created_value, '%Y-%m-%d %H:%M:%S.%f')
        else:
            return None 

    def resolve_updated(self, info):
        updated_value = self.get('updated', None)

        if updated_value:
            return datetime.strptime(updated_value, '%Y-%m-%d %H:%M:%S.%f')
        else:
            return None


class Query(ObjectType):
    all_cards = graphene.List(CardType)

    def resolve_all_cards(self, info):
        try:
            response = table.scan()
            items = []

            for item in response.get("Items", []):
                if isinstance(item, dict):
                    items.append(item)
                elif isinstance(item, str):
                    deserialized_item = deserializer.deserialize({'S': item})
                    items.append(deserialized_item)
                else:
                    print(f"Unexpected item type: {type(item)} - {item}")

            return items  # Return the list directly, don't wrap it in a JsonResponse
        except Exception as e:
            return []  # Handle errors appropriately


class CreateCard(graphene.Mutation):
    class Arguments:
        title = graphene.String()
        description = graphene.String()
        column = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()

    id = graphene.String()
    title = graphene.String()
    description = graphene.String()
    column = graphene.String()
    created = graphene.DateTime()
    updated = graphene.DateTime()

    def mutate(self, info, title, description, column):
        try:
            # Generate a unique ID for the new card using uuid and convert it to a string
            new_id = str(uuid.uuid4())

            current_time = datetime.now()
            item = {
                'id': new_id,
                'title': title,
                'description': description,
                'column': column,
                'created': str(current_time),  # Add the 'created' field
                'updated': str(current_time)  # Add the 'updated' field
            }
            response = table.put_item(Item=item)

            return CreateCard(
                success=True,
                message="Card created successfully",
                id=new_id,
                title=title,
                description=description,
                column=column,
                created=current_time,
                updated=current_time
            )
        except Exception as e:
            return CreateCard(success=False, message=str(e))


class UpdateCard(graphene.Mutation):
    class Arguments:
        id = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()
        column = graphene.String()
        created = graphene.DateTime()
        updated = graphene.DateTime()

    success = graphene.Boolean()
    message = graphene.String()
    id = graphene.String()
    title = graphene.String()
    description = graphene.String()
    column = graphene.String()
    created = graphene.DateTime()
    updated = graphene.DateTime()

    def mutate(self, info, id, title, description, column):
        try:
            item = {}
            update_expression = 'SET'
            expression_attribute_values = {}

            if title:
                item['title'] = title
                update_expression += ' #t = :title,'
                expression_attribute_values[':title'] = title

            if description:
                item['description'] = description
                update_expression += ' #d = :description,'
                expression_attribute_values[':description'] = description

            if column:
                item['column'] = column
                update_expression += ' #s = :column,'
                expression_attribute_values[':column'] = column

            # Add or update the 'updated' field
            item['updated'] = str(datetime.now())
            update_expression += ' #u = :updated,'
            expression_attribute_values[':updated'] = item['updated']

            # Remove the trailing comma from the update_expression
            update_expression = update_expression.rstrip(',')

            response = table.update_item(
                Key={'id': id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames={'#t': 'title', '#d': 'description', '#s': 'column', '#u': 'updated'},
                ReturnValues='ALL_NEW'
            )

            updated_item = response.get('Attributes', {})
            return UpdateCard(
                success=True,
                message="Card updated successfully",
                id=id,
                title=updated_item.get('title', ''),
                description=updated_item.get('description', ''),
                column=updated_item.get('column', ''),
                updated=str(datetime.now()),
            )

        except Exception as e:
            return UpdateCard(success=False, message=str(e))


class DeleteCard(graphene.Mutation):
    class Arguments:
        id = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, id):
        try:
            response = table.delete_item(Key={"id": id})
            return DeleteCard(success=True, message="Card deleted successfully")
        except Exception as e:
            return DeleteCard(success=False, message=str(e))


class Mutation(graphene.ObjectType):
    create_card = CreateCard.Field()
    update_card = UpdateCard.Field()
    delete_card = DeleteCard.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
