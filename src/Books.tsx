import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_ENDPOINT = 'https://your-api-endpoint.execute-api.region.amazonaws.com';

interface Book {
  book_id: string;
  title: string;
  borrower: string;
  borrowed_date: string;
  returned_date?: string;
}

const Books: React.FC = () => {
  // State to store the books list
  const [books, setBooks] = useState<Book[]>([]);
  
  // States for the input fields
  const [title, setTitle] = useState<string>('');
  const [borrower, setBorrower] = useState<string>('');
  const [borrowedDate, setBorrowedDate] = useState<string>('');
  const [returnedDate, setReturnedDate] = useState<string>('');

  // Fetch books data from API when the component is mounted
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/books`);
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  // Function to create a new book using the API
  const createBook = async () => {
    try {
      await axios.post(`${API_ENDPOINT}/books`, {
        operation: 'create',
        title,
        borrower,
        borrowed_date: borrowedDate,
        returned_date: returnedDate,
      });
      setTitle('');
      setBorrower('');
      setBorrowedDate('');
      setReturnedDate('');
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  // Function to update an existing book using the API
  const updateBook = async (bookId: string) => {
    try {
      await axios.post(`${API_ENDPOINT}/books`, {
        operation: 'update',
        book_id: bookId,
        title,
        borrower,
        borrowed_date: borrowedDate,
        returned_date: returnedDate,
      });
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  // Function to delete a book using the API
  const deleteBook = async (bookId: string) => {
    try {
      await axios.post(`${API_ENDPOINT}/books`, {
        operation: 'delete',
        book_id: bookId,
      });
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div>
      <h1>Book Manager</h1>
      {/* Render form for adding a new book */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          type="text"
          value={borrower}
          onChange={(e) => setBorrower(e.target.value)}
          placeholder="Borrower"
        />
        <input
          type="date"
          value={borrowedDate}
          onChange={(e) => setBorrowedDate(e.target.value)}
        />
        <input
          type="date"
          value={returnedDate}
          onChange={(e) => setReturnedDate(e.target.value)}
        />
       <button onClick={createBook}>Add Book</button>
  </div>

  {/* Render books list */}
  <ul>
    {books.map((book) => (
      <li key={book.book_id}>
        <div>
          <strong>Title:</strong> {book.title}
        </div>
        <div>
          <strong>Borrower:</strong> {book.borrower}
        </div>
        <div>
          <strong>Borrowed Date:</strong> {book.borrowed_date}
        </div>
        {book.returned_date && (
          <div>
            <strong>Returned Date:</strong> {book.returned_date}
          </div>
        )}
        <button onClick={() => updateBook(book.book_id)}>Edit Book</button>
        <button onClick={() => deleteBook(book.book_id)}>Delete Book</button>
      </li>
    ))}
  </ul>
</div>
);
};

export default Books;
