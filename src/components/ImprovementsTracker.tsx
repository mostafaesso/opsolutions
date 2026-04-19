import React, { useState } from 'react';
import { useImprovements } from '../hooks/useImprovements';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Improvement } from '../integrations/supabase/phase2_types';

const CATEGORIES = [
  'automation',
  'process',
  'analytics',
  'integration',
  'workflow',
  'reporting',
];

const CATEGORY_COLORS: Record<string, string> = {
  automation: 'bg-blue-100 text-blue-800',
  process: 'bg-purple-100 text-purple-800',
  analytics: 'bg-green-100 text-green-800',
  integration: 'bg-orange-100 text-orange-800',
  workflow: 'bg-pink-100 text-pink-800',
  reporting: 'bg-cyan-100 text-cyan-800',
};

export const ImprovementsTracker: React.FC<{ companySlug: string; userEmail?: string }> = ({ companySlug, userEmail }) => {
  const { improvements, loading, error, fetchAll, createImprovement, updateImprovement, deleteImprovement } = useImprovements(companySlug);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Improvement>>({
    category: 'process',
  });
  const [editingImprovement, setEditingImprovement] = useState<Improvement | null>(null);

  const handleFetchAll = () => {
    fetchAll(companySlug);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createImprovement({
        company_slug: companySlug,
        created_by: userEmail || 'unknown',
        ...formData,
      } as Omit<Improvement, 'id' | 'created_at' | 'updated_at'>);
      setFormData({ category: 'process' });
      setIsAddOpen(false);
      handleFetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImprovement) return;
    try {
      await updateImprovement(editingImprovement.id, formData);
      setIsEditOpen(false);
      handleFetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (imp: Improvement) => {
    setEditingImprovement(imp);
    setFormData(imp);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this improvement? This cannot be undone.')) {
      try {
        await deleteImprovement(id);
        handleFetchAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredImprovements = filterCategory
    ? improvements.filter(imp => imp.category === filterCategory)
    : improvements;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Improvements Tracker</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Record Improvement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Improvement</DialogTitle>
              <DialogDescription>
                Document HubSpot implementation improvements with before/after images and metrics.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="e.g., Automated Lead Assignment"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={formData.category || 'process'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="What was implemented and why?"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Implemented Date *</label>
                  <Input
                    type="date"
                    value={formData.implemented_date || ''}
                    onChange={(e) => setFormData({ ...formData, implemented_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Impact Summary</label>
                  <Input
                    placeholder="e.g., 30% time savings, 2.5x more leads"
                    value={formData.impact_summary || ''}
                    onChange={(e) => setFormData({ ...formData, impact_summary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Image className="w-4 h-4" /> Before Image URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/before.jpg"
                    value={formData.before_image_url || ''}
                    onChange={(e) => setFormData({ ...formData, before_image_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Image className="w-4 h-4" /> After Image URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/after.jpg"
                    value={formData.after_image_url || ''}
                    onChange={(e) => setFormData({ ...formData, after_image_url: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Record Improvement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory(null)}
        >
          All
        </Button>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <Button variant="outline" onClick={handleFetchAll} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </Button>

      {/* Improvements List */}
      <div className="grid gap-4">
        {filteredImprovements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No improvements recorded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredImprovements.map((imp) => (
            <Card key={imp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{imp.title}</CardTitle>
                      <Badge className={CATEGORY_COLORS[imp.category]}>
                        {imp.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      Implemented on {new Date(imp.implemented_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(imp)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(imp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === imp.id ? null : imp.id)}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === imp.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === imp.id && (
                <CardContent className="space-y-4">
                  {imp.description && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{imp.description}</p>
                    </div>
                  )}

                  {imp.impact_summary && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Impact</h4>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        {imp.impact_summary}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {imp.before_image_url && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Before</h4>
                        <img
                          src={imp.before_image_url}
                          alt="Before"
                          className="w-full h-40 object-cover rounded border"
                        />
                      </div>
                    )}
                    {imp.after_image_url && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">After</h4>
                        <img
                          src={imp.after_image_url}
                          alt="After"
                          className="w-full h-40 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Added by {imp.created_by} on {new Date(imp.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {isEditOpen && editingImprovement && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Improvement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Impact Summary</label>
                <Input
                  value={formData.impact_summary || ''}
                  onChange={(e) => setFormData({ ...formData, impact_summary: e.target.value })}
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
