import React from 'react'
import Modal from '../../common/Modal'
import { Button, Input, Label, FormGroup } from '../../common/Forms'

export default function AddDishModal({ isOpen, onClose, onAdd, newDish, setNewDish }) {
  if (!isOpen) return null

  return (
    <Modal
      title="Add New Dish"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onAdd}>Add Dish</Button>
        </>
      }
    >
      <FormGroup>
        <Label>Dish Name</Label>
        <Input 
          placeholder="e.g. Chicken Biryani" 
          value={newDish.name}
          onChange={e => setNewDish({...newDish, name: e.target.value})}
        />
      </FormGroup>
      <FormGroup>
        <Label>Category</Label>
        <Input 
          placeholder="e.g. Main Course" 
          value={newDish.category}
          onChange={e => setNewDish({...newDish, category: e.target.value})}
        />
      </FormGroup>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup>
          <Label>Price (₹)</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={newDish.price}
            onChange={e => setNewDish({...newDish, price: e.target.value})}
          />
        </FormGroup>
        <FormGroup>
          <Label>Daily Qty</Label>
          <Input 
            type="number" 
            placeholder="50" 
            value={newDish.daily_quantity}
            onChange={e => setNewDish({...newDish, daily_quantity: e.target.value})}
          />
        </FormGroup>
      </div>
      <FormGroup>
        <Label>Image URL</Label>
        <Input 
          placeholder="https://..." 
          value={newDish.image_url}
          onChange={e => setNewDish({...newDish, image_url: e.target.value})}
        />
      </FormGroup>
    </Modal>
  )
}
