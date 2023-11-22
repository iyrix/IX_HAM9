import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  GET_CARDS,
  UPDATE_CARD_MUTATION,
  DELETE_CARD_MUTATION,
  CREATE_CARD_MUTATION,
} from "../queries/cards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSpinner,
  faExclamationCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./modal";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const sortItems = (items, order) => {
  const sortedItems = [...items];
  sortedItems.sort((a, b) => {
    const dateA = new Date(a.updated);
    const dateB = new Date(b.updated);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
  return sortedItems;
};

const Projects = () => {
  const { loading, error, data } = useQuery(GET_CARDS);
  const [columns, setColumns] = useState({});
  const [updateCard] = useMutation(UPDATE_CARD_MUTATION);
  const [deleteCard] = useMutation(DELETE_CARD_MUTATION);
  const [createCard] = useMutation(CREATE_CARD_MUTATION);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [sortOrder, setSortOrder] = useState({ columnId: null, order: "asc" });

  useEffect(() => {
    if (data) {
      const initialColumns = {
        todo: {
          name: "Todo",
          items: sortItems(
            data.allCards.filter((item) => item.column === "todo"),
            sortOrder.columnId === "todo" ? sortOrder.order : "asc"
          ),
        },
        in_progress: {
          name: "In Progress",
          items: sortItems(
            data.allCards.filter((item) => item.column === "in_progress"),
            sortOrder.columnId === "in_progress" ? sortOrder.order : "asc"
          ),
        },
        in_review: {
          name: "In Review",
          items: sortItems(
            data.allCards.filter((item) => item.column === "in_review"),
            sortOrder.columnId === "in_review" ? sortOrder.order : "asc"
          ),
        },
        done: {
          name: "Done",
          items: sortItems(
            data.allCards.filter((item) => item.column === "done"),
            sortOrder.columnId === "done" ? sortOrder.order : "asc"
          ),
        },
      };
      setColumns(initialColumns);
    }
  }, [data, sortOrder.columnId, sortOrder.order]);

  const toggleSortOrder = (columnId) => {
    setSortOrder((prevSortOrder) => ({
      columnId,
      order:
        prevSortOrder.columnId === columnId
          ? prevSortOrder.order === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (destination.droppableId === "deleteArea") {
      // Delete the project if dropped in the delete area
      const movedItem = sourceColumn.items[source.index];
      try {
        await deleteCard({
          variables: {
            id: movedItem.id,
          },
        });
        // Update the columns state after deletion
        const updatedItems = sourceColumn.items.filter(
          (item, index) => index !== source.index
        );
        setColumns((prevColumns) => ({
          ...prevColumns,
          [source.droppableId]: {
            ...sourceColumn,
            items: updatedItems,
          },
        }));
      } catch (error) {
        console.error("Error deleting card:", error.message);
      }
    } else if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const items = reorder(
        sourceColumn.items,
        source.index,
        destination.index
      );
      setColumns((prevColumns) => ({
        ...prevColumns,
        [source.droppableId]: {
          ...sourceColumn,
          items,
        },
      }));
    } else {
      // Move to a different column
      const movedItem = {
        ...sourceColumn.items[source.index],
        column: destination.droppableId,
      };
      const updatedSourceItems = sourceColumn.items.filter(
        (item, index) => index !== source.index
      );

      setColumns((prevColumns) => ({
        ...prevColumns,
        [source.droppableId]: {
          ...sourceColumn,
          items: updatedSourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: [
            ...destColumn.items.slice(0, destination.index),
            movedItem,
            ...destColumn.items.slice(destination.index),
          ],
        },
      }));

      // Update the card's column in the backend
      try {
        await updateCard({
          variables: {
            id: movedItem.id,
            title: movedItem.title,
            description: movedItem.description,
            column: destination.droppableId,
          },
        });
      } catch (error) {
        console.error("Error updating card:", error.message);
      }
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-4xl text-blue-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center">
        <FontAwesomeIcon
          icon={faExclamationCircle}
          className="text-4xl text-red-500"
        />
        <p className="text-xl text-red-500 ml-5">
          {error.message}. Please try again.
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-wrap p-4 bg-slate-800 min-h-screen">
        {Object.keys(columns).map((columnId) => (
          <div key={columnId} className="w-full md:w-1/3 lg:w-1/4 p-4">
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-zinc-300 border border-gray-300 rounded p-4 mb-4 min-h-[50vh]"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    {columns[columnId].name}
                    <FontAwesomeIcon
                      icon={faSort}
                      className="ml-2 cursor-pointer"
                      onClick={() => toggleSortOrder(columnId)}
                    />
                  </h3>
                  {columns[columnId].items.map((item, index) => (
                    <Draggable
                      draggableId={item.id}
                      key={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative p-4 mb-4 bg-gray-100 border border-gray-300 rounded"
                        >
                          <h3 className="text-xl font-semibold mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-700 mb-2">
                            {item.description}
                          </p>
                          <p className="text-gray-500">Column: {item.column}</p>
                          <p className="text-gray-800">
                            Last Updated:{" "}
                            {new Date(item.updated).toLocaleString()}
                          </p>
                          <div className="absolute top-5 right-5">
                            <Modal item={item} isEdit updateCard={updateCard} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
        <center>
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 p-4 items-center justify-center">
            <Droppable droppableId="deleteArea">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 border border-red-500 rounded p-4"
                >
                  <h3 className="text-lg font-semibold text-red-500 mb-4">
                    Delete Task
                  </h3>
                  <FontAwesomeIcon
                    icon={faTrash}
                    size="3x"
                    className="text-red-500 mb-4"
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </center>
      </div>
    </DragDropContext>
  );
};

export default Projects;
