import React from 'react';
import UserList from './UserList';

const Sidebar = ({ users }) => {
  return (
    <div style={styles.sidebar}>
      <h3>Users Online</h3>
      <UserList users={users} />
    </div>
  );
};

const styles = {
  sidebar: {
    width: '200px',
    borderRight: '1px solid #ccc',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
};

export default Sidebar;