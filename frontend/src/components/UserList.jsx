import React from 'react';

const UserList = ({ users }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {users.length === 0 && <p>No users online</p>}
      {users.map((user, index) => (
        <div key={index} style={styles.user}>
          {user.name}
        </div>
      ))}
    </div>
  );
};

const styles = {
  user: {
    padding: '5px 10px',
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
  },
};

export default UserList;