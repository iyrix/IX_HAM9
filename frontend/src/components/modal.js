import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@apollo/client";
import {
  GET_CARDS,
  CREATE_CARD_MUTATION,
  UPDATE_CARD_MUTATION,
} from "../queries/cards";

Modal.setAppElement("#root");

const CustomModal = (props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: props.item ? props.item.title : "",
    description: props.item ? props.item.description : "",
  });

  const [createCard] = useMutation(CREATE_CARD_MUTATION);
  const [updateCard] = useMutation(UPDATE_CARD_MUTATION);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description } = formData;

    if (props.isEdit) {
      // If editing, call the updateCard mutation
      await updateCard({
        variables: {
          id: props.item.id,
          title,
          description,
          column: props.item.column,
        },
      });
    } else {
      // If creating, call the createCard mutation
      await createCard({
        variables: {
          title,
          description,
          column: "todo",
        },
        refetchQueries: [{ query: GET_CARDS }],
      });
    }

    // Close the modal after the mutation is completed
    closeModal();
  };

  const icon = props.isEdit ? faEdit : faPlus;

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
    },
  };

  return (
    <div>
      <div onClick={openModal} style={{ cursor: "pointer" }}>
        <FontAwesomeIcon icon={icon} className="mr-2" />
        {props.isEdit ? "Edit" : "Add new task"}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <div
          id="crud-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {props.isEdit ? "Edit Task" : "Create New Task"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="crud-modal"
                  onClick={closeModal}
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <form className="space-y-4 p-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    value={formData.title}
                    required
                    onChange={(e) => handleInputChange(e, "title")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    value={formData.description}
                    required
                    onChange={(e) => handleInputChange(e, "description")}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {props.isEdit ? "Edit Task" : "Create Task"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomModal;
