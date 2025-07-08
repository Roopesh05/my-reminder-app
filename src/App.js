import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './App.css';

// Replace with your VAPID public key
const VAPID_PUBLIC_KEY = 'BPIRTqVASFkgZXN7ZxhnAggIyVRH6odSACevMoSKKnOpjmfxXrebjNIFPNyQ0Ug6hdQBxQFXeYUBdj5pRI6XfSM';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pushSubscription, setPushSubscription] = useState(null);

  useEffect(() => {
    const storedReminders = JSON.parse(localStorage.getItem('reminders'));
    if (storedReminders) {
      setReminders(storedReminders);
    }

    // Request notification permission and subscribe to push
    async function setupPush() {
      const permission = await Notification.requestPermission();
      console.log('Notification permission status:', permission);

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          };
          try {
            const subscription = await registration.pushManager.subscribe(subscribeOptions);
            setPushSubscription(subscription);
            console.log('Push subscription:', subscription);

            // Send subscription to your backend
            await fetch('/api/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription),
            });
            console.log('Subscription sent to backend');
          } catch (error) {
            console.error('Failed to subscribe to push:', error);
          }
        }
      }
    }
    setupPush();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleAddReminder = async () => {
    if (newReminder.trim() !== '' && newReminderDate && pushSubscription) {
      const reminderData = {
        reminderText: newReminder,
        reminderDate: newReminderDate,
        subscription: pushSubscription,
      };

      try {
        const response = await fetch('/api/schedule-reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reminderData),
        });
        const data = await response.json();
        console.log('Backend response:', data);

        if (response.ok) {
          // Add to local state only after successful scheduling with backend
          setReminders([...reminders, { text: newReminder, date: newReminderDate, completed: false, id: Date.now() }]);
          setNewReminder('');
          setNewReminderDate('');
          setShowModal(false);
        } else {
          alert('Failed to schedule reminder with backend. Check console for details.');
        }
      } catch (error) {
        console.error('Error sending reminder to backend:', error);
        alert('Error connecting to backend. Check console for details.');
      }
    } else if (!pushSubscription) {
      alert('Push notifications not subscribed. Please ensure permissions are granted and try again.');
    }
  };

  const handleToggleComplete = (id) => {
    setReminders(
      reminders.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center">My Reminders</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Reminder
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a new reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reminder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reminder text"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddReminder}>
            Save Reminder
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="card">
        <div className="card-body">
          <ul className="list-group">
            {reminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map(reminder => (
              <li
                key={reminder.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  reminder.completed ? 'list-group-item-light' : ''
                }`}
              >
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={reminder.completed}
                    onChange={() => handleToggleComplete(reminder.id)}
                  />
                  <span
                    style={{
                      textDecoration: reminder.completed ? 'line-through' : 'none',
                    }}
                  >
                    {reminder.text}
                  </span>
                  <br />
                  <small className="text-muted">
                    {new Date(reminder.date).toLocaleString()}
                  </small>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteReminder(reminder.id)}
                >
                  <FaTrash />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;