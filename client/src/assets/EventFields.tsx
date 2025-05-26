import { title } from "process";

export const columns = [
  {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
  },
  {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 100,
  },
  {
      title: "Organization Name",
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 200,
  },
  {
      title: "Total Donations",
      dataIndex: 'totalDonations',
      key: 'totalDonations',
      width: 120,
  },
];

export const attendeeColumns = [
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
        dataIndex: 'organization',
        key: 'organization',
    },
    {
        title:"Total Donations",
        dataIndex: 'totalDonations',
        key: 'totalDonations',
    },
    {
        title: 'Address Line 1',
        dataIndex: 'address1',
        key: 'address1',
    },
    {
        title: 'Address Line 2',
        dataIndex: 'address2',
        key: 'address2',
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
