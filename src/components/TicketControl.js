import React, { useEffect, useState } from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import { db, auth } from './../firebase.js';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";

function TicketControl() {

  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { 
    const unSubscribe = onSnapshot(
      collection(db, "tickets"), 
      (collectionSnapshot) => {
        const tickets = [];
        collectionSnapshot.forEach((doc) => {
            tickets.push({
              names: doc.data().names, 
              location: doc.data().location, 
              issue: doc.data().issue, 
              id: doc.id
            });
        });
        setMainTicketList(tickets);
      }, 
      (error) => {
        setError(error.message);
      }
    );

    return () => unSubscribe();
  }, []);


  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  // commented out after re-writing it to use the firestore
  // const handleDeletingTicket = (id) => {
  //   const newMainTicketList = mainTicketList.filter(ticket => ticket.id !== id);
  //   setMainTicketList(newMainTicketList);
  //   setSelectedTicket(null);
  // }

  const handleEditClick = () => {
    setEditing(true);
  }
  // commented out after re-writing it to use the firestore
  // const handleEditingTicketInList = (ticketToEdit) => {
  //   const editedMainTicketList = mainTicketList
  //   selectedTicket.id
  //     .filter(ticket => ticket.id !== selectedTicket.id)
  //     .concat(ticketToEdit);
  //     setMainTicketList(editedMainTicketList);
  //     setEditing(false);
  //     setSelectedTicket(null);
  // }

  // commented out after re-writing it to use the firestore
  // const handleAddingNewTicketToList = (newTicket) => {
  //   const newMainTicketList = mainTicketList.concat(newTicket);
  //   setMainTicketList(newMainTicketList);
  //   setFormVisibleOnPage(false)
  // }

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, "tickets", id));
    setSelectedTicket(null);
  } 

  const handleEditingTicketInList = async (ticketToEdit) => {
    const ticketRef = doc(db, "tickets", ticketToEdit.id);
    await updateDoc(ticketRef, ticketToEdit);
    setEditing(false);
    setSelectedTicket(null);
  }

  const handleAddingNewTicketToList = async (newTicketData) => {
    await addDoc(collection(db, "tickets"), newTicketData);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }

  
  if (auth.currentUser == null) {
    return (
      <React.Fragment>
        <h1>You must be signed in to access the queue.</h1>
      </React.Fragment>
    )
  } else if (auth.currentUser != null) {

    let currentlyVisibleState = null;
    let buttonText = null; 

    if (error) {
      currentlyVisibleState = <p>There was an error: {error}</p>
    } else if (editing) {      
      currentlyVisibleState = <EditTicketForm 
      ticket = {selectedTicket} 
      onEditTicket = {handleEditingTicketInList} />
      buttonText = "Return to Ticket List";
    } else if (selectedTicket != null) {
      currentlyVisibleState = <TicketDetail 
      ticket={selectedTicket} 
      onClickingDelete={handleDeletingTicket}
      onClickingEdit = {handleEditClick} />
      buttonText = "Return to Ticket List";
    } else if (formVisibleOnPage) {
      currentlyVisibleState = <NewTicketForm 
      onNewTicketCreation={handleAddingNewTicketToList}/>;
      buttonText = "Return to Ticket List"; 
    } else {
      currentlyVisibleState = <TicketList 
      onTicketSelection={handleChangingSelectedTicket} 
      ticketList={mainTicketList} />;
      buttonText = "Add Ticket"; 
    }
    return (
      <React.Fragment>
        {currentlyVisibleState}
        {error ? null : <button onClick={handleClick}>{buttonText}</button>} 
      </React.Fragment>
    );
  }
}

export default TicketControl;