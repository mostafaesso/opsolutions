import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerDetails } from '@/integrations/supabase/phase2_types';

export const useCustomers = (companySlug?: string) => {
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all customers (admin only)
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customer_details')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (err) throw err;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single customer by company slug
  const fetchBySlug = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customer_details')
        .select('*')
        .eq('company_slug', slug)
        .single();
      
      if (err && err.code !== 'PGRST116') throw err; // PGRST116 = no rows
      setCustomer(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  // Create new customer details
  const createCustomer = async (details: Omit<CustomerDetails, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customer_details')
        .insert([details])
        .select()
        .single();
      
      if (err) throw err;
      setCustomer(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update customer details
  const updateCustomer = async (
    slug: string,
    updates: Partial<Omit<CustomerDetails, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customer_details')
        .update(updates)
        .eq('company_slug', slug)
        .select()
        .single();
      
      if (err) throw err;
      setCustomer(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete customer details (cascades to related data)
  const deleteCustomer = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('customer_details')
        .delete()
        .eq('company_slug', slug);
      
      if (err) throw err;
      setCustomer(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listener if slug provided
  useEffect(() => {
    if (!companySlug) return;
    
    fetchBySlug(companySlug);
    
    const subscription = supabase
      .channel(`customer_details:${companySlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_details',
          filter: `company_slug=eq.${companySlug}`,
        },
        (payload) => {
          if (payload.new) setCustomer(payload.new as CustomerDetails);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [companySlug]);

  return {
    customers,
    customer,
    loading,
    error,
    fetchAll,
    fetchBySlug,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
