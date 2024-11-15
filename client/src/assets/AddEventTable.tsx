import { title } from "process";

export const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
    },
    { 
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',

    },
    {
        title:"Organization Name",
        dataIndex: 'organizationName',
        key: 'organizationName',
    },
    {
        title:"Total Donations",
        dataIndex: 'totalDonations',
        key: 'totalDonations',
    },
    {
        title: 'Address Line 1',
        dataIndex: 'addressLine1',
        key: 'addressLine1',
    },
    {
        title: 'Address Line 2',
        dataIndex: 'addressLine2',
        key: 'addressLine2',
    },
    {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
    },
    {
        title: 'pmm',
        dataIndex: 'pmm',
        key: 'pmm',
    },
    {
        title:'smm',
        dataIndex: 'smm',
        key: 'smm',
    },
    {
        title: 'vmm',
        dataIndex: 'vmm',
        key: 'vmm',
    }
];

export const cityNames = [
    "Victoria",
    "Nanaimo",
    "Courtenay",
    "Parksville",
    "Campbell River",
    "Saanich",
    "Vancouver",
    "Surrey",
    "Burnaby",
    "Richmond"
];

export const topicNames = [
    "General Cancer Research",
    "Breast Cancer",
    "Blood Cancer",
    "Gastric Cancer"
];
