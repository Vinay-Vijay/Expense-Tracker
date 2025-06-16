// 'use client';

// import { useEffect, useState } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// type Expense = {
//   id: string;
//   title: string;
//   amount: number;
//   category: string;
// };

// export default function ExpenseList() {
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
//   const [filterCategory, setFilterCategory] = useState<string>('all');
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     const fetchExpenses = async () => {
//       let query = supabase.from('expenses').select('*');
//       if (filterCategory !== 'all') {
//         query = query.eq('category', filterCategory);
//       }
//       const { data, error } = await query;
//       if (!error && data) setExpenses(data);
//     };
//     fetchExpenses();
//   }, [filterCategory]);

//   const handleDelete = async (id: string) => {
//     const { error } = await supabase.from('expenses').delete().eq('id', id);
//     if (!error) window.location.reload();
//   };

//   const handleEditSave = async () => {
//     if (!editingExpense) return;
//     const { error } = await supabase.from('expenses').update({
//       title: editingExpense.title,
//       amount: editingExpense.amount,
//       category: editingExpense.category,
//     }).eq('id', editingExpense.id);
//     if (!error) {
//       setEditingExpense(null);
//       window.location.reload();
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Category Filter */}
//       <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
//         <SelectTrigger className="w-[200px]">
//           <SelectValue placeholder="Filter by Category" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="all">All</SelectItem>
//           <SelectItem value="Food">Food</SelectItem>
//           <SelectItem value="Transport">Transport</SelectItem>
//           <SelectItem value="Entertainment">Entertainment</SelectItem>
//         </SelectContent>
//       </Select>

//       {/* Expenses Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {expenses.map(exp => (
//           <Card key={exp.id}>
//             <CardContent className="p-4 space-y-2">
//               <h2 className="text-xl font-semibold">{exp.title}</h2>
//               <p>₹ {exp.amount}</p>
//               <p className="text-sm text-gray-500">{exp.category}</p>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline">Actions</Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuItem onClick={() => setEditingExpense(exp)}>Edit</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => handleDelete(exp.id)}>Delete</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Edit Expense Dialog */}
//       {editingExpense && (
//         <Dialog open={true} onOpenChange={() => setEditingExpense(null)}>
//           <DialogContent className="space-y-4">
//             <div>
//               <Label>Title</Label>
//               <Input
//                 value={editingExpense.title}
//                 onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label>Amount</Label>
//               <Input
//                 type="number"
//                 value={editingExpense.amount}
//                 onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
//               />
//             </div>
//             <div>
//               <Label>Category</Label>
//               <Select
//                 value={editingExpense.category}
//                 onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Food">Food</SelectItem>
//                   <SelectItem value="Transport">Transport</SelectItem>
//                   <SelectItem value="Entertainment">Entertainment</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <Button onClick={handleEditSave}>Save Changes</Button>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchExpenses = async () => {
      let query = supabase.from('expenses').select('*');
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      const { data, error } = await query;
      if (!error && data) setExpenses(data);
    };
    fetchExpenses();
  }, [filterCategory]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) window.location.reload();
  };

  const handleEditSave = async () => {
    if (!editingExpense) return;
    const { error } = await supabase.from('expenses').update({
      title: editingExpense.title,
      amount: editingExpense.amount,
      category: editingExpense.category,
    }).eq('id', editingExpense.id);
    if (!error) {
      setEditingExpense(null);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <Select
        value={filterCategory}
        onValueChange={(value) => setFilterCategory(value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Food">Food</SelectItem>
          <SelectItem value="Transport">Transport</SelectItem>
          <SelectItem value="Entertainment">Entertainment</SelectItem>
        </SelectContent>
      </Select>

      {/* Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((exp) => (
          <Card key={exp.id}>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{exp.title}</h2>
              <p>₹ {exp.amount}</p>
              <p className="text-sm text-gray-500">{exp.category}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingExpense(exp)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(exp.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <Dialog open={true} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="space-y-4">
            <DialogTitle className="sr-only">Edit Expense</DialogTitle>

            <div>
              <Label>Title</Label>
              <Input
                value={editingExpense.title}
                onChange={(e) =>
                  setEditingExpense({ ...editingExpense, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={editingExpense.amount}
                onChange={(e) =>
                  setEditingExpense({
                    ...editingExpense,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editingExpense.category}
                onValueChange={(value) =>
                  setEditingExpense({ ...editingExpense, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
