
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  subcategory_id: string;
  featured: boolean;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSubcategoryId, setFormSubcategoryId] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  
  const [formCategoryName, setFormCategoryName] = useState('');
  const [formCategoryDescription, setFormCategoryDescription] = useState('');
  const [formSubcategoryName, setFormSubcategoryName] = useState('');
  const [formSubcategoryDescription, setFormSubcategoryDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  
  // Fetch products, categories, and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
        
        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData);
        
        // Fetch products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortField, sortDirection]);
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form fields
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormQuantity('');
    setFormImageUrl('');
    setFormSubcategoryId('');
    setFormFeatured(false);
  };
  
  // Set form fields for editing
  const setFormForEdit = (product: Product) => {
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(product.price.toString());
    setFormQuantity(product.quantity.toString());
    setFormImageUrl(product.image_url || '');
    setFormSubcategoryId(product.subcategory_id);
    setFormFeatured(product.featured || false);
  };
  
  // Add a new product
  const handleAddProduct = async () => {
    try {
      if (!formName || !formPrice || !formQuantity || !formSubcategoryId) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const newProduct = {
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        quantity: parseInt(formQuantity),
        image_url: formImageUrl,
        subcategory_id: formSubcategoryId,
        featured: formFeatured
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();
      
      if (error) throw error;
      
      setProducts([...products, data[0]]);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    }
  };
  
  // Update a product
  const handleUpdateProduct = async () => {
    try {
      if (!selectedProduct) return;
      
      if (!formName || !formPrice || !formQuantity || !formSubcategoryId) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const updatedProduct = {
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        quantity: parseInt(formQuantity),
        image_url: formImageUrl,
        subcategory_id: formSubcategoryId,
        featured: formFeatured
      };
      
      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', selectedProduct.id);
      
      if (error) throw error;
      
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p));
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };
  
  // Delete a product
  const handleDeleteProduct = async () => {
    try {
      if (!selectedProduct) return;
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };
  
  // Add a new category
  const handleAddCategory = async () => {
    try {
      if (!formCategoryName) {
        toast({
          title: 'Error',
          description: 'Please enter a category name',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: formCategoryName,
          description: formCategoryDescription
        }])
        .select();
      
      if (error) throw error;
      
      setCategories([...categories, data[0]]);
      setIsAddCategoryDialogOpen(false);
      setFormCategoryName('');
      setFormCategoryDescription('');
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };
  
  // Add a new subcategory
  const handleAddSubcategory = async () => {
    try {
      if (!formSubcategoryName || !formCategoryId) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{
          name: formSubcategoryName,
          description: formSubcategoryDescription,
          category_id: formCategoryId
        }])
        .select();
      
      if (error) throw error;
      
      setSubcategories([...subcategories, data[0]]);
      setIsAddSubcategoryDialogOpen(false);
      setFormSubcategoryName('');
      setFormSubcategoryDescription('');
      setFormCategoryId('');
      
      toast({
        title: 'Success',
        description: 'Subcategory added successfully',
      });
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subcategory',
        variant: 'destructive',
      });
    }
  };
  
  const getSubcategoryName = (id: string) => {
    const subcategory = subcategories.find(s => s.id === id);
    return subcategory ? subcategory.name : 'Unknown';
  };
  
  const getCategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return 'Unknown';
    
    const category = categories.find(c => c.id === subcategory.category_id);
    return category ? category.name : 'Unknown';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddCategoryDialogOpen(true)} variant="outline" size="sm">
            Add Category
          </Button>
          <Button onClick={() => setIsAddSubcategoryDialogOpen(true)} variant="outline" size="sm">
            Add Subcategory
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Category</th>
                <th className="py-3 px-4 text-left font-medium">Subcategory</th>
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('price')}
                  >
                    Price (₦)
                    {sortField === 'price' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('quantity')}
                  >
                    Quantity
                    {sortField === 'quantity' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Featured</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{getCategoryName(product.subcategory_id)}</td>
                    <td className="py-3 px-4">{getSubcategoryName(product.subcategory_id)}</td>
                    <td className="py-3 px-4">₦{product.price.toLocaleString()}</td>
                    <td className="py-3 px-4">{product.quantity}</td>
                    <td className="py-3 px-4">{product.featured ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setFormForEdit(product);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    {searchTerm ? 'No products found matching your search' : 'No products available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select value={formSubcategoryId} onValueChange={setFormSubcategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <React.Fragment key={category.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">
                          {category.name}
                        </div>
                        {subcategories
                          .filter(sub => sub.category_id === category.id)
                          .map(subcategory => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured" className="text-sm font-medium leading-none">
                Featured Product
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₦) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory">Subcategory *</Label>
                <Select value={formSubcategoryId} onValueChange={setFormSubcategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <React.Fragment key={category.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">
                          {category.name}
                        </div>
                        {subcategories
                          .filter(sub => sub.category_id === category.id)
                          .map(subcategory => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-featured" className="text-sm font-medium leading-none">
                Featured Product
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{selectedProduct?.name}"?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                value={formCategoryName}
                onChange={(e) => setFormCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={formCategoryDescription}
                onChange={(e) => setFormCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubcategoryDialogOpen} onOpenChange={setIsAddSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Subcategory Name *</Label>
              <Input
                id="subcategory-name"
                value={formSubcategoryName}
                onChange={(e) => setFormSubcategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-category">Parent Category *</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-description">Description</Label>
              <Textarea
                id="subcategory-description"
                value={formSubcategoryDescription}
                onChange={(e) => setFormSubcategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
