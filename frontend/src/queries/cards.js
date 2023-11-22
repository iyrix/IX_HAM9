import gql from "graphql-tag";

export const GET_CARDS = gql`
  query {
    allCards {
      id
      title
      description
      column
      created
      updated
    }
  }
`;

export const CREATE_CARD_MUTATION = gql`
  mutation CreateCard($title: String!, $description: String!, $column: String!) {
    createCard(title: $title, description: $description, column: $column) {
      success
      message
      id
      title
      description
      column
      created
      updated
    }
  }
`;

export const UPDATE_CARD_MUTATION = gql`
  mutation UpdateCard(
    $id: String!
    $title: String!
    $description: String!
    $column: String!
  ) {
    updateCard(
      id: $id
      title: $title
      description: $description
      column: $column
    ) {
      success
      message
      id
      title
      description
      column
      created
      updated
    }
  }
`;

export const DELETE_CARD_MUTATION = gql`
  mutation DeleteCard($id: String!) {
    deleteCard(id: $id) {
      success
      message
    }
  }
`;
