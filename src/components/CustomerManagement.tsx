import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { CustomerDetails } from '../integrations/supabase/phase2_types';

export const CustomerManagement: React.FC<{ companySlug?: string }> = ({ companySlug }) => {
  const { customers, customer, loading, error, fetchAll, fetchBySlug, createCustomer, updateCustomer, deleteCustomer } = useCustomers(companySlug);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomerDetails>>({
    locations: [],
  });

  const handleFetchAll = () => {
    fetchAll();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData as Omit<CustomerDetails, 'id' | 'created_at' | 'updated_at'>);
      setFormData({ locations: [] });
      setIsAddOpen(false);
      handleFetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    try {
      await updateCustomer(customer.company_slug, formData);
      setIsEditOpen(false);
      fetchBySlug(customer.company_slug);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm('Delete this customer? This cannot be undone.')) {
      try {
        await deleteCustomer(slug);
        handleFetchAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (cust: CustomerDetails) => {
    setFormData(cust);
    fetchBySlug(cust.company_slug);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter customer company details, contact information, and HubSpot credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Company Slug"
                  value={formData.company_slug || ''}
                  onChange={(e) => setFormData({ ...formData, company_slug: e.target.value })}
                  required
                />
                <Input
                  placeholder="Website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
                <Input
                  placeholder="Industry"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
                <Input
                  placeholder="Employee Count"
                  type="number"
                  value={formData.employee_count || ''}
                  onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                />
                <Input
                  placeholder="Main Contact Name"
                  value={formData.main_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, main_contact_name: e.target.value })}
                />
                <Input
                  placeholder="Main Contact Email"
                  type="email"
                  value={formData.main_contact_email || ''}
                  onChange={(e) => setFormData({ ...formData, main_contact_email: e.target.value })}
                />
              </div>
              <Input
                placeholder="HubSpot Private App Token"
                type="password"
                value={formData.hubspot_token || ''}
                onChange={(e) => setFormData({ ...formData, hubspot_token: e.target.value })}
              />
              <Input
                placeholder="HubSpot Account ID"
                value={formData.hubspot_account_id || ''}
                onChange={(e) => setFormData({ ...formData, hubspot_account_id: e.target.value })}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Customer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button variant="outline" onClick={handleFetchAll} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Customers'}
      </Button>

      <div className="grid gap-4">
        {customers.map((cust) => (
          <Card key={cust.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{cust.company_slug}</CardTitle>
                  <CardDescription>{cust.website}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cust)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(cust.company_slug)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === cust.id ? null : cust.id)}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === cust.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedId === cust.id && (
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">Industry:</span> {cust.industry || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Employees:</span> {cust.employee_count || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Contact:</span> {cust.main_contact_name} ({cust.main_contact_email})
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">HubSpot Account ID:</span> {cust.hubspot_account_id || 'Not set'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Locations:</span> {cust.locations?.join(', ') || 'N/A'}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {isEditOpen && customer && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
                <Input
                  placeholder="Industry"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
                <Input
                  placeholder="Employee Count"
                  type="number"
                  value={formData.employee_count || ''}
                  onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                />
                <Input
                  placeholder="Main Contact Name"
                  value={formData.main_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, main_contact_name: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
