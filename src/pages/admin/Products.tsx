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
  DialogDescription
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
import { useAuth } from '@/contexts/auth/AuthContext';

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
  const { isAdmin, isAuthenticated } = useAuth();
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data from Supabase...");
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }
        
        console.log("Categories fetched:", categoriesData);
        setCategories(categoriesData || []);
        
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
          throw subcategoriesError;
        }
        
        console.log("Subcategories fetched:", subcategoriesData);
        setSubcategories(subcategoriesData || []);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (productsError) {
          console.error('Error fetching products:', productsError);
          throw productsError;
        }
        
        console.log("Products fetched:", productsData);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please check the console for details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormQuantity('');
    setFormImageUrl('');
    setFormSubcategoryId('');
    setFormFeatured(false);
  };
  
  const setFormForEdit = (product: Product) => {
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(product.price.toString());
    setFormQuantity(product.quantity.toString());
    setFormImageUrl(product.image_url || '');
    setFormSubcategoryId(product.subcategory_id || '');
    setFormFeatured(product.featured || false);
  };
  
  const handleAddProduct = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to add products.',
          variant: 'destructive',
        });
        return;
      }

      if (!formName || !formPrice || !formQuantity) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Adding new product:", { name: formName, price: formPrice, subcategory_id: formSubcategoryId });
      
      const newProduct = {
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        quantity: parseInt(formQuantity),
        image_url: formImageUrl,
        subcategory_id: formSubcategoryId || null,
        featured: formFeatured
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();
      
      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }
      
      console.log("Product added successfully:", data);
      
      const { data: updatedProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (fetchError) throw fetchError;
      setProducts(updatedProducts || []);
      
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: `Failed to add product: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateProduct = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to update products.',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedProduct) return;
      
      if (!formName || !formPrice || !formQuantity) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Updating product:", selectedProduct.id);
      
      const updatedProduct = {
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        quantity: parseInt(formQuantity),
        image_url: formImageUrl,
        subcategory_id: formSubcategoryId || null,
        featured: formFeatured
      };
      
      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', selectedProduct.id);
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      console.log("Product updated successfully");
      
      const { data: updatedProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (fetchError) throw fetchError;
      setProducts(updatedProducts || []);
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: `Failed to update product: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteProduct = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to delete products.',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedProduct) return;
      
      console.log("Deleting product:", selectedProduct.id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
      
      console.log("Product deleted successfully");
      
      const { data: updatedProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (fetchError) throw fetchError;
      setProducts(updatedProducts || []);
      
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: `Failed to delete product: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleAddCategory = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to add categories.',
          variant: 'destructive',
        });
        return;
      }

      if (!formCategoryName) {
        toast({
          title: 'Error',
          description: 'Please enter a category name',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Adding category:", formCategoryName);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: formCategoryName,
          description: formCategoryDescription
        }])
        .select();
      
      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }
      
      console.log("Category added successfully:", data);
      
      const { data: categoriesData, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (fetchError) throw fetchError;
      setCategories(categoriesData || []);
      
      setIsAddCategoryDialogOpen(false);
      setFormCategoryName('');
      setFormCategoryDescription('');
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: `Failed to add category: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleAddSubcategory = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to add subcategories.',
          variant: 'destructive',
        });
        return;
      }

      if (!formSubcategoryName || !formCategoryId) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Adding subcategory:", formSubcategoryName, "to category:", formCategoryId);
      
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{
          name: formSubcategoryName,
          description: formSubcategoryDescription,
          category_id: formCategoryId
        }])
        .select();
      
      if (error) {
        console.error('Error adding subcategory:', error);
        throw error;
      }
      
      console.log("Subcategory added successfully:", data);
      
      const { data: subcategoriesData, error: fetchError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');
        
      if (fetchError) throw fetchError;
      setSubcategories(subcategoriesData || []);
      
      setIsAddSubcategoryDialogOpen(false);
      setFormSubcategoryName('');
      setFormSubcategoryDescription('');
      setFormCategoryId('');
      
      toast({
        title: 'Success',
        description: 'Subcategory added successfully',
      });
    } catch (error: any) {
      console.error('Error adding subcategory:', error);
      toast({
        title: 'Error',
        description: `Failed to add subcategory: ${error.message || 'Unknown error'}`,
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
                    <td className="py-3 px-4">{product.subcategory_id ? getCategoryName(product.subcategory_id) : 'Uncategorized'}</td>
                    <td className="py-3 px-4">{product.subcategory_id ? getSubcategoryName(product.subcategory_id) : 'None'}</td>
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
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Add a new product to your inventory</DialogDescription>
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
                <Label htmlFor="subcategory">Subcategory</Label>
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Make changes to your product</DialogDescription>
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
                <Label htmlFor="edit-subcategory">Subcategory</Label>
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
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
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
      
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Categories help organize your products</DialogDescription>
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
      
      <Dialog open={isAddSubcategoryDialogOpen} onOpenChange={setIsAddSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogDescription>Subcategories provide more detail to your product organization</DialogDescription>
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
