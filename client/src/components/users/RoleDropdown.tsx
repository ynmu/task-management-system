import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface Role {
    id: number;
    roleName: string;
}

interface RoleDropdownProps {
    onRoleSelect: (roleId: number, roleName: string) => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ onRoleSelect }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | ''>(''); // State to manage selected role ID

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/roles`); // Adjust endpoint as needed
                const fetchedRoles = response.data;
                setRoles(fetchedRoles);

                // Automatically select the first role if available
                if (fetchedRoles.length > 0 && !selectedRoleId) {
                    const firstRole = fetchedRoles[0];
                    setSelectedRoleId(firstRole.id);
                    onRoleSelect(firstRole.id, firstRole.roleName);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, [onRoleSelect, selectedRoleId]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleId = Number(e.target.value);
        const selectedRoleName = e.target.selectedOptions[0].text;
        setSelectedRoleId(selectedRoleId); // Update selected role ID
        onRoleSelect(selectedRoleId, selectedRoleName);
    };

    return (
        <div className="form-group">
            <label className="auth-form-label" htmlFor="role">Role</label>
            <select id="role" onChange={handleRoleChange} value={selectedRoleId} required>
                <option value="" disabled>Select a role</option>
                {roles.map((role) => (
                    <option key={role.id} value={role.id} className='auth-dropdown-option'>
                        {role.roleName}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RoleDropdown;
