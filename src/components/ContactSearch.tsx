
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, User } from 'lucide-react';
import { toast } from "sonner";
import { Company } from './CompanySearch';

export interface Contact {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  companyId?: string;
}

interface ContactSearchProps {
  onSelect: (contact: Contact) => void;
  value?: Contact | null;
  selectedCompany?: Company | null;
  disabled?: boolean;
}

const ContactSearch: React.FC<ContactSearchProps> = ({ 
  onSelect, 
  value, 
  selectedCompany,
  disabled 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for adding new contact
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'fullName'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobilePhone: '',
    companyId: selectedCompany?.id
  });
  
  useEffect(() => {
    if (value) {
      setSearchTerm(value.fullName);
    } else {
      setSearchTerm('');
    }
  }, [value]);
  
  useEffect(() => {
    if (selectedCompany) {
      setNewContact(prev => ({
        ...prev,
        companyId: selectedCompany.id
      }));
      
      // Load contacts for the selected company
      loadContactsForCompany(selectedCompany.id);
    }
  }, [selectedCompany]);
  
  const loadContactsForCompany = async (companyId: string) => {
    if (!companyId) return;
    
    setLoading(true);
    setShowResults(true);
    
    try {
      // In a real app, this would be an API call to Hubspot
      // For now, we'll simulate a response
      setTimeout(() => {
        // These would be contacts associated with the selected company
        const mockContacts: { [key: string]: Contact[] } = {
          '1': [ // Acme Inc.
            { 
              id: '1',
              fullName: 'Sarah Chen',
              firstName: 'Sarah',
              lastName: 'Chen',
              email: 'sarah.chen@acmeinc.com',
              phone: '(555) 123-4567',
              mobilePhone: '(555) 987-6543',
              companyId: '1'
            },
            { 
              id: '2',
              fullName: 'John Smith',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@acmeinc.com',
              phone: '(555) 234-5678',
              mobilePhone: '(555) 876-5432',
              companyId: '1'
            }
          ],
          '2': [ // Global Tech
            { 
              id: '3',
              fullName: 'Michael Rodriguez',
              firstName: 'Michael',
              lastName: 'Rodriguez',
              email: 'mrodriguez@globaltech.com',
              phone: '(555) 345-6789',
              mobilePhone: '(555) 765-4321',
              companyId: '2'
            }
          ],
          '3': [ // Innovate Solutions
            { 
              id: '4',
              fullName: 'David Park',
              firstName: 'David',
              lastName: 'Park',
              email: 'david.park@innovate.solutions',
              phone: '(555) 456-7890',
              mobilePhone: '(555) 654-3210',
              companyId: '3'
            }
          ]
        };
        
        const companyContacts = mockContacts[companyId] || [];
        setSearchResults(companyContacts);
        
        // If there's only one contact, automatically select it
        if (companyContacts.length === 1) {
          handleSelectContact(companyContacts[0]);
        }
        
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts");
      setLoading(false);
    }
  };
  
  const searchContacts = async (term: string) => {
    if (!selectedCompany || !term || term.length < 2) {
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    
    try {
      // In a real app, this would be an API call to Hubspot
      // For now, we'll simulate a response
      setTimeout(() => {
        // These would be contacts associated with the selected company
        const mockContacts: { [key: string]: Contact[] } = {
          '1': [ // Acme Inc.
            { 
              id: '1',
              fullName: 'Sarah Chen',
              firstName: 'Sarah',
              lastName: 'Chen',
              email: 'sarah.chen@acmeinc.com',
              phone: '(555) 123-4567',
              mobilePhone: '(555) 987-6543',
              companyId: '1'
            },
            { 
              id: '2',
              fullName: 'John Smith',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@acmeinc.com',
              phone: '(555) 234-5678',
              mobilePhone: '(555) 876-5432',
              companyId: '1'
            }
          ],
          '2': [ // Global Tech
            { 
              id: '3',
              fullName: 'Michael Rodriguez',
              firstName: 'Michael',
              lastName: 'Rodriguez',
              email: 'mrodriguez@globaltech.com',
              phone: '(555) 345-6789',
              mobilePhone: '(555) 765-4321',
              companyId: '2'
            }
          ],
          '3': [ // Innovate Solutions
            { 
              id: '4',
              fullName: 'David Park',
              firstName: 'David',
              lastName: 'Park',
              email: 'david.park@innovate.solutions',
              phone: '(555) 456-7890',
              mobilePhone: '(555) 654-3210',
              companyId: '3'
            }
          ]
        };
        
        const companyContacts = mockContacts[selectedCompany.id] || [];
        const filteredContacts = companyContacts.filter(contact => 
          contact.fullName.toLowerCase().includes(term.toLowerCase())
        );
        
        setSearchResults(filteredContacts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error searching contacts:", error);
      toast.error("Failed to search contacts");
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchContacts(term);
  };
  
  const handleSelectContact = (contact: Contact) => {
    onSelect(contact);
    setSearchTerm(contact.fullName);
    setShowResults(false);
  };
  
  const handleAddContact = () => {
    setShowAddDialog(true);
    setShowResults(false);
  };
  
  const handleNewContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitNewContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newContact.firstName || !newContact.lastName || !newContact.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      // In a real app, this would be an API call to Hubspot
      // For now, we'll simulate a response
      
      const fullName = `${newContact.firstName} ${newContact.lastName}`;
      
      const createdContact: Contact = {
        id: `new-${Date.now()}`,
        fullName,
        ...newContact
      };
      
      // Select the newly created contact
      onSelect(createdContact);
      setSearchTerm(fullName);
      
      // Reset the form and close the dialog
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobilePhone: '',
        companyId: selectedCompany?.id
      });
      setShowAddDialog(false);
      
      toast.success("Contact added successfully");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };
  
  return (
    <div className="space-y-2 relative">
      <Label htmlFor="contact">Contact Name</Label>
      <div className="relative">
        <Input 
          id="contact" 
          placeholder={selectedCompany ? "Search for a contact..." : "Select a company first"} 
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-9"
          disabled={disabled || !selectedCompany}
          onFocus={() => {
            if (selectedCompany) {
              setShowResults(true);
              if (!searchResults.length) {
                loadContactsForCompany(selectedCompany.id);
              }
            }
          }}
          onBlur={() => {
            // Delay hiding results to allow for selection
            setTimeout(() => setShowResults(false), 200);
          }}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showResults && selectedCompany && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((contact) => (
                <div 
                  key={contact.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="font-medium">{contact.fullName}</div>
                  <div className="space-y-1 text-sm text-gray-500">
                    {contact.email && <div><span className="font-medium">Email:</span> {contact.email}</div>}
                    {contact.phone && <div><span className="font-medium">Phone:</span> {contact.phone}</div>}
                    {contact.mobilePhone && <div><span className="font-medium">Mobile Phone:</span> {contact.mobilePhone}</div>}
                  </div>
                </div>
              ))}
              <div 
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600"
                onClick={handleAddContact}
              >
                <Plus size={16} className="mr-2" />
                <span>Add a new contact</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 text-center text-sm text-gray-500">No contacts found</div>
              <div 
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600 border-t border-gray-100"
                onClick={handleAddContact}
              >
                <Plus size={16} className="mr-2" />
                <span>Add a new contact</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Add New Contact for {selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNewContact} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-contact-first-name">First Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="new-contact-first-name"
                    name="firstName"
                    value={newContact.firstName}
                    onChange={handleNewContactChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-contact-last-name">Last Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="new-contact-last-name"
                    name="lastName"
                    value={newContact.lastName}
                    onChange={handleNewContactChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-contact-email">Email Address <span className="text-red-500">*</span></Label>
                <Input 
                  id="new-contact-email"
                  name="email"
                  type="email"
                  value={newContact.email}
                  onChange={handleNewContactChange}
                  placeholder="example@company.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-contact-phone">Phone Number</Label>
                  <Input 
                    id="new-contact-phone"
                    name="phone"
                    value={newContact.phone}
                    onChange={handleNewContactChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-contact-mobile">Mobile Phone</Label>
                  <Input 
                    id="new-contact-mobile"
                    name="mobilePhone"
                    value={newContact.mobilePhone}
                    onChange={handleNewContactChange}
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSearch;
