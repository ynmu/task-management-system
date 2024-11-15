import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Role {
    id: number;
    roleName: string;
}

interface RoleDropdownProps {
    onRoleSelect: (roleId: number, roleName: string) => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ onRoleSelect }) => {
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/roles`); // Adjust endpoint as needed
                setRoles(response.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, []);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleId = Number(e.target.value);
        const selectedRoleName = e.target.selectedOptions[0].text;
        onRoleSelect(selectedRoleId, selectedRoleName);
    };

    return (
        <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select id="role" onChange={handleRoleChange} required>
                <option value="" disabled>Select a role</option>
                {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.roleName}
                    </option>
                ))}
            </select>
        </div>
    );
};


export default RoleDropdown;
