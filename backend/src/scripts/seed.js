import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Task from '../models/Task.js';
import Revenue from '../models/Revenue.js';
import Activity from '../models/Activity.js';
import { ROLES } from '../config/roles.js';

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Lead.deleteMany(),
    Client.deleteMany(),
    Task.deleteMany(),
    Revenue.deleteMany(),
    Activity.deleteMany(),
  ]);

  const users = await User.create([
    { name: 'Admin User', email: 'admin@agency.com', password: 'admin123', role: ROLES.ADMIN },
    { name: 'Sameed', email: 'sameed@agency.com', password: 'sameed123', role: ROLES.SAMEED },
    { name: 'Saboor', email: 'saboor@agency.com', password: 'saboor123', role: ROLES.SABOOR },
    { name: 'Fatiq', email: 'fatiq@agency.com', password: 'fatiq123', role: ROLES.FATIQ },
  ]);

  const [admin, sameed, saboor, fatiq] = users;

  const leads = await Lead.create([
    { companyName: 'TechFlow Inc', contactPerson: 'John Smith', email: 'john@techflow.com', phone: '+1-555-0101', website: 'https://techflow.com', country: 'USA', industry: 'Technology', source: 'Website', assignedTo: saboor._id, status: 'New', aiScore: 65, createdBy: saboor._id },
    { companyName: 'GreenEnergy Co', contactPerson: 'Sarah Johnson', email: 'sarah@greenenergy.com', phone: '+1-555-0102', website: 'https://greenenergy.com', country: 'UK', industry: 'Energy', source: 'LinkedIn', assignedTo: saboor._id, status: 'Contacted', aiScore: 72, createdBy: saboor._id },
    { companyName: 'RetailMax', contactPerson: 'Mike Chen', email: 'mike@retailmax.com', phone: '+1-555-0103', country: 'Canada', industry: 'Retail', source: 'Referral', assignedTo: sameed._id, status: 'Meeting Scheduled', meetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), aiScore: 85, createdBy: sameed._id },
    { companyName: 'HealthPlus', contactPerson: 'Emily Davis', email: 'emily@healthplus.com', phone: '+1-555-0104', website: 'https://healthplus.com', country: 'USA', industry: 'Healthcare', source: 'Cold Outreach', assignedTo: fatiq._id, status: 'Proposal Sent', estimatedValue: 15000, aiScore: 78, createdBy: fatiq._id },
    { companyName: 'FinanceHub', contactPerson: 'Robert Wilson', email: 'robert@financehub.com', country: 'USA', industry: 'Finance', source: 'Referral', assignedTo: saboor._id, status: 'Negotiation', estimatedValue: 25000, aiScore: 90, createdBy: saboor._id },
    { companyName: 'AutoDrive Systems', contactPerson: 'Lisa Park', email: 'lisa@autodrive.com', phone: '+1-555-0106', country: 'South Korea', industry: 'Automotive', source: 'Website', assignedTo: sameed._id, status: 'Won', estimatedValue: 50000, aiScore: 95, createdBy: sameed._id },
    { companyName: 'OldTech Corp', contactPerson: 'Tom Brown', email: 'tom@oldtech.com', country: 'USA', industry: 'Technology', source: 'Email', assignedTo: fatiq._id, status: 'Lost', aiScore: 20, createdBy: fatiq._id },
  ]);

  const clients = await Client.create([
    { companyName: 'AutoDrive Systems', contactPerson: 'Lisa Park', email: 'lisa@autodrive.com', services: ['AI Chatbot', 'Process Automation'], monthlyRetainer: 5000, assignedTo: sameed._id, leadId: leads[5]._id, projects: [{ name: 'Customer Support Bot', status: 'Active' }] },
    { companyName: 'MedCare Solutions', contactPerson: 'Anna White', email: 'anna@medcare.com', services: ['Workflow Automation'], monthlyRetainer: 3500, assignedTo: fatiq._id, status: 'Active' },
  ]);

  await Task.create([
    { title: 'Follow up with TechFlow', description: 'Send intro email about AI services', assignedTo: saboor._id, createdBy: admin._id, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), priority: 'High', relatedLead: leads[0]._id },
    { title: 'Prepare proposal for HealthPlus', assignedTo: sameed._id, createdBy: admin._id, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: 'Urgent', status: 'In Progress', relatedLead: leads[3]._id },
    { title: 'Onboard AutoDrive client', assignedTo: fatiq._id, createdBy: admin._id, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: 'Medium', relatedClient: clients[0]._id },
    { title: 'Update CRM documentation', assignedTo: sameed._id, createdBy: admin._id, priority: 'Low', status: 'Todo' },
  ]);

  await Revenue.create([
    { client: clients[0]._id, amount: 5000, type: 'Monthly Retainer', paymentDate: new Date(), recordedBy: sameed._id, leadId: leads[5]._id },
    { client: clients[0]._id, amount: 10000, type: 'One Time', paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), recordedBy: sameed._id, description: 'Initial setup fee' },
    { client: clients[1]._id, amount: 3500, type: 'Monthly Retainer', paymentDate: new Date(), recordedBy: fatiq._id },
  ]);

  await User.findByIdAndUpdate(saboor._id, { stats: { leadsAdded: 3, meetingsBooked: 0, dealsClosed: 0, revenueGenerated: 0, tasksCompleted: 0 } });
  await User.findByIdAndUpdate(sameed._id, { stats: { leadsAdded: 2, meetingsBooked: 1, dealsClosed: 1, revenueGenerated: 15000, tasksCompleted: 0 } });
  await User.findByIdAndUpdate(fatiq._id, { stats: { leadsAdded: 2, meetingsBooked: 0, dealsClosed: 0, revenueGenerated: 3500, tasksCompleted: 0 } });

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin:  admin@agency.com / admin123');
  console.log('Sameed: sameed@agency.com / sameed123');
  console.log('Saboor: saboor@agency.com / saboor123');
  console.log('Fatiq:  fatiq@agency.com / fatiq123');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
