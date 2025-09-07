// // components/customers/CustomerList.js
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { api } from '../../services/api';
// import LoadingSpinner from '../common/LoadingSpinner';
// import CustomerForm from './CustomerForm';
// import './Customer.css';

// const CustomerList = () => {
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [showForm, setShowForm] = useState(false);
//   const [editingCustomer, setEditingCustomer] = useState(null);

//   const limit = 10;

//   useEffect(() => {
//     fetchCustomers();
//   }, [currentPage, searchTerm]);

//   const fetchCustomers = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/customers', {
//         params: {
//           page: currentPage,
//           limit,
//           search: searchTerm
//         }
//       });
      
//       setCustomers(response.data.customers || []);
//       setTotalPages(Math.ceil((response.data.total || 0) / limit));
//     } catch (err) {
//       console.error('Fetch customers error:', err);
//       setError('Failed to load customers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (customerId) => {
//     if (window.confirm('Are you sure you want to delete this customer?')) {
//       try {
//         await api.delete(`/customers/${customerId}`);
//         fetchCustomers();
//       } catch (err) {
//         console.error('Delete customer error:', err);
//         alert('Failed to delete customer');
//       }
//     }
//   };

//   const handleFormSubmit = () => {
//     setShowForm(false);
//     setEditingCustomer(null);
//     fetchCustomers();
//   };

//   const handleEdit = (customer) => {
//     setEditingCustomer(customer);
//     setShowForm(true);
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };

//   if (loading && customers.length === 0) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="customer-list-container">
//       <div className="page-header">
//         <h1>Customers</h1>
//         <button 
//           onClick={() => setShowForm(true)}
//           className="btn btn-primary"
//         >
//           Add Customer
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="search-container">
//         <input
//           type="text"
//           placeholder="Search customers by name or email..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//           className="search-input"
//         />
//       </div>

//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       {/* Customer Table */}
//       <div className="table-container">
//         <table className="customer-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Company</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {customers.map(customer => (
//               <tr key={customer._id}>
//                 <td>
//                   <div className="customer-name">
//                     <div className="customer-avatar">
//                       {customer.name.charAt(0).toUpperCase()}
//                     </div>
//                     {customer.name}
//                   </div>
//                 </td>
//                 <td>{customer.email}</td>
//                 <td>{customer.phone}</td>
//                 <td>{customer.company}</td>
//                 <td>
//                   <div className="action-buttons">
//                     <Link 
//                       to={`/customers/${customer._id}`}
//                       className="btn btn-sm btn-outline"
//                     >
//                       View
//                     </Link>
//                     <button 
//                       onClick={() => handleEdit(customer)}
//                       className="btn btn-sm btn-secondary"
//                     >
//                       Edit
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(customer._id)}
//                       className="btn btn-sm btn-danger"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {customers.length === 0 && !loading && (
//           <div className="empty-state">
//             <h3>No customers found</h3>
//             <p>
//               {searchTerm 
//                 ? 'Try adjusting your search terms' 
//                 : 'Add your first customer to get started'
//               }
//             </p>
//             {!searchTerm && (
//               <button 
//                 onClick={() => setShowForm(true)}
//                 className="btn btn-primary"
//               >
//                 Add First Customer
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="pagination">
//           <button 
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="btn btn-outline"
//           >
//             Previous
//           </button>
          
//           <span className="page-info">
//             Page {currentPage} of {totalPages}
//           </span>
          
//           <button 
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="btn btn-outline"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* Customer Form Modal */}
//       {showForm && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <CustomerForm 
//               customer={editingCustomer}
//               onSubmit={handleFormSubmit}
//               onCancel={() => {
//                 setShowForm(false);
//                 setEditingCustomer(null);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerList;


// components/customers/CustomerList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import CustomerForm from './CustomerForm';
import './Customer.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers', {
        params: {
          page: currentPage,
          limit,
          search: searchTerm
        }
      });
      
      setCustomers(response.data.customers || []);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
    } catch (err) {
      console.error('Fetch customers error:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${customerId}`);
        fetchCustomers();
      } catch (err) {
        console.error('Delete customer error:', err);
        alert('Failed to delete customer');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="customer-list-container">
      <div className="page-header">
        <h1>Customers</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Customer Table */}
      <div className="table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer._id}>
                <td>
                  <div className="customer-name">
                    <div className="customer-avatar">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    {customer.name}
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.company}</td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/customers/${customer._id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(customer._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && !loading && (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Add your first customer to get started'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Add First Customer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) {
            setShowForm(false);
            setEditingCustomer(null);
          }
        }}>
          <div className="modal-content">
            <CustomerForm 
              customer={editingCustomer}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;