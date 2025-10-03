import React from 'react';
import GenericSearch from '../utils/GenericSearch';
import { searchUsers } from '../store/admin/userManagementSlice';


export default function UserSearch({ onSearchResults }) {
  return (
    <GenericSearch
      action={searchUsers}
      selector={(state) => state.userManagement}
      onSearchResults={onSearchResults}
      placeholder="Search Users..."
    />
  );
}
