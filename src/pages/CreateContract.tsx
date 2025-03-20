
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Download, Printer, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { CompanySearch, Company } from '@/components/CompanySearch';

// Define the package options
interface PackageOption {
  name: string;
  originalPrice: string;
  discountedPrice: string;
  features: string[];
  isTopSeller?: boolean;
}

// Define the extras options
interface ExtraOption {
  id: string;
  name: string;
}

// Define the payment options
interface PaymentOption {
  id: string;
  name: string;
  rates: {
    percentage: string;
    fee: string;
    type?: string;
  }
}

const CreateContract: React.FC = () => {
  const navigate = useNavigate();
  const contractRef = useRef<HTMLDivElement>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  
  // Company and contact information
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [restaurantData, setRestaurantData] = useState({
    address: "",
    contactPerson: "",
    email: "",
    mobile: ""
  });
  const [alloBeratername, setAlloBeratername] = useState("");
  
  // Package options
  const packages: PackageOption[] = [
    {
      name: "S",
      originalPrice: "129€",
      discountedPrice: "99€",
      features: ["TSE Kasse", "unbegrenzte Lizenzen", "1 kostenloses Extras"]
    },
    {
      name: "M",
      originalPrice: "159€",
      discountedPrice: "129€",
      features: ["TSE Kasse", "unbegrenzte Lizenzen", "3 kostenlose Extras"],
      isTopSeller: true
    },
    {
      name: "L",
      originalPrice: "199€",
      discountedPrice: "159€",
      features: ["TSE Kasse", "unbegrenzte Lizenzen", "5 kostenlose Extras"]
    }
  ];
  
  // Extras options
  const extras: ExtraOption[] = [
    { id: "reservierung", name: "Reservierung" },
    { id: "webshop", name: "Webshop" },
    { id: "gutscheinkarten", name: "Online Gutscheinkarten" },
    { id: "rechnung", name: "Kauf auf Rechnung" },
    { id: "scan-to-order", name: "Scan-to-Order" },
    { id: "wolt", name: "Wolt Integration" },
    { id: "lieferando", name: "Lieferando Integration" },
    { id: "uber", name: "Uber Integration" }
  ];
  
  // Payment options
  const paymentOptions: PaymentOption[] = [
    { 
      id: "option1", 
      name: "0.79% + 0.08€", 
      rates: { 
        percentage: "0.79%", 
        fee: "0.08€",
        type: "/Transaktion"
      }
    },
    { 
      id: "option2", 
      name: "0.49% + 0.08€ / 0.99% + 0.08€", 
      rates: { 
        percentage: "0.49% + 0.08€",
        fee: "0.99% + 0.08€",
        type: "/Debit Karte / Kredit Karten"
      }
    }
  ];
  
  // Hardware options
  const [hardwareOptions, setHardwareOptions] = useState({
    bonDrucker: false,
    alloGo: false,
    iPad: false
  });
  
  // Services options
  const [servicesOptions, setServicesOptions] = useState({
    support: true,
    steuerberater: true,
    website: false,
    fotoshooting: false
  });
  
  // Self-order options
  const [selfOrderOptions, setSelOrderOptions] = useState({
    kiosk: false,
    tablet: false,
    bierhahnkamera: false
  });
  
  // Update state when company is selected
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    
    // Update restaurant data based on company
    setRestaurantData({
      address: company.address || "",
      contactPerson: "", // This would be filled from a contact if selected
      email: "",
      mobile: ""
    });
  };
  
  // Handle extras selection
  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };
  
  // Handle hardware options
  const handleHardwareToggle = (option: keyof typeof hardwareOptions) => {
    setHardwareOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Handle services options
  const handleServicesToggle = (option: keyof typeof servicesOptions) => {
    setServicesOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Handle self-order options
  const handleSelfOrderToggle = (option: keyof typeof selfOrderOptions) => {
    setSelOrderOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Generate PDF from the contract
  const generatePDF = () => {
    if (!contractRef.current) return;
    
    const element = contractRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'allo-contract.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
    
    toast.success("Contract PDF generated successfully");
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      toast.error("Please select a restaurant");
      return;
    }
    
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }
    
    if (!selectedPayment) {
      toast.error("Please select a payment option");
      return;
    }
    
    // In a real app, this would send data to HubSpot
    console.log("Submitting contract to HubSpot...");
    
    // Show success dialog
    setShowSuccessDialog(true);
  };
  
  // Find the selected package
  const currentPackage = packages.find(p => p.name === selectedPackage);
  
  return (
    <div className="allo-page pb-12">
      <div className="w-full max-w-4xl mx-auto py-4">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Home
        </Button>
        
        <div className="allo-card w-full mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Contract</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restaurant Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <CompanySearch 
                  onSelect={handleCompanySelect}
                  value={selectedCompany}
                  required={true}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData({...restaurantData, address: e.target.value})}
                    placeholder="Restaurant address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input 
                      id="contactPerson" 
                      value={restaurantData.contactPerson}
                      onChange={(e) => setRestaurantData({...restaurantData, contactPerson: e.target.value})}
                      placeholder="Contact name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={restaurantData.email}
                      onChange={(e) => setRestaurantData({...restaurantData, email: e.target.value})}
                      placeholder="Email address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input 
                      id="mobile" 
                      value={restaurantData.mobile}
                      onChange={(e) => setRestaurantData({...restaurantData, mobile: e.target.value})}
                      placeholder="Mobile number"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allo-berater">Dein allO Berater</Label>
                  <Input 
                    id="allo-berater" 
                    value={alloBeratername}
                    onChange={(e) => setAlloBeratername(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Package Selection */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Wähle Dein Paket</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.name}
                    className={`relative border rounded-md p-4 ${selectedPackage === pkg.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    {pkg.isTopSeller && (
                      <div className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-xs transform rotate-12">
                        <span>Top</span>
                        <span>Seller</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <Checkbox 
                        id={`package-${pkg.name}`}
                        checked={selectedPackage === pkg.name}
                        onCheckedChange={() => setSelectedPackage(selectedPackage === pkg.name ? "" : pkg.name)}
                      />
                      <Label htmlFor={`package-${pkg.name}`} className="text-lg font-medium">{pkg.name}</Label>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm">TSE Kasse</div>
                      <div className="text-sm">unbegrenzte Lizenzen</div>
                      <div className="text-sm">{pkg.features[2]}</div>
                    </div>
                    
                    <div className="flex items-baseline space-x-2">
                      <span className="line-through text-gray-500">{pkg.originalPrice}</span>
                      <span className="font-bold">{pkg.discountedPrice}</span>
                      <span className="text-sm text-gray-600">/Monat</span>
                    </div>
                    
                    {pkg.name === "M" && (
                      <div className="text-xs text-gray-500 mt-1">*Monatlich kündbar</div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-black text-amber-400 py-3 px-4 rounded-md text-center font-medium">
                Wichtig: nur 9,9€/Monat in den ersten 3 Monaten!
              </div>
            </div>
            
            {/* Free Extras */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Wähle Deine kostenlosen Extras</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extras.map((extra) => (
                  <div key={extra.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`extra-${extra.id}`}
                      checked={selectedExtras.includes(extra.id)}
                      onCheckedChange={() => handleExtraToggle(extra.id)}
                      disabled={
                        selectedPackage === "S" && selectedExtras.length >= 1 && !selectedExtras.includes(extra.id) ||
                        selectedPackage === "M" && selectedExtras.length >= 3 && !selectedExtras.includes(extra.id) ||
                        selectedPackage === "L" && selectedExtras.length >= 5 && !selectedExtras.includes(extra.id) ||
                        !selectedPackage
                      }
                    />
                    <Label htmlFor={`extra-${extra.id}`}>{extra.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Wähle Deinen unglaublich günstigen Zahlungstarif</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-100 p-4 rounded-md">
                {paymentOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`payment-${option.id}`}
                      checked={selectedPayment === option.id}
                      onCheckedChange={() => setSelectedPayment(selectedPayment === option.id ? "" : option.id)}
                    />
                    <Label htmlFor={`payment-${option.id}`}>{option.name}</Label>
                    
                    {option.id === "option1" && selectedPayment === "option2" && (
                      <span className="text-sm">oder</span>
                    )}
                  </div>
                ))}
                
                <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                  <Checkbox id="cardTypes" checked={true} disabled />
                  <Label htmlFor="cardTypes" className="text-sm">Gültig auch für Amex, Firmenkarten & internationale Karten</Label>
                </div>
                <div className="md:col-span-2 text-xs text-gray-500">
                  *die Gebühren werden auf den Endkunden umgelegt*
                </div>
              </div>
            </div>
            
            {/* Self Order Options */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Mache Umsatz wie McDonald's</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="self-order-kiosk"
                    checked={selfOrderOptions.kiosk}
                    onCheckedChange={() => handleSelfOrderToggle("kiosk")}
                  />
                  <Label htmlFor="self-order-kiosk">Self-order Kiosk: 59€ /Kiosk/Monat</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="kitchen-monitor"
                    checked={selfOrderOptions.tablet}
                    onCheckedChange={() => handleSelfOrderToggle("tablet")}
                  />
                  <Label htmlFor="kitchen-monitor">Kitchen Monitor: 59€ /Monat</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tablet-ordering"
                    checked={selfOrderOptions.bierhahnkamera}
                    onCheckedChange={() => handleSelfOrderToggle("bierhahnkamera")}
                  />
                  <Label htmlFor="tablet-ordering">Dirmeler Bierhanksystem: 59€ /Monat</Label>
                </div>
              </div>
            </div>
            
            {/* Hardware Package */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Kostenloses Hardware Paket</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bon-drucker"
                    checked={hardwareOptions.bonDrucker}
                    onCheckedChange={() => handleHardwareToggle("bonDrucker")}
                  />
                  <Label htmlFor="bon-drucker">2x Bon Drucker</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allo-go"
                    checked={hardwareOptions.alloGo}
                    onCheckedChange={() => handleHardwareToggle("alloGo")}
                  />
                  <Label htmlFor="allo-go">1x allO Go</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ipad"
                    checked={hardwareOptions.iPad}
                    onCheckedChange={() => handleHardwareToggle("iPad")}
                  />
                  <Label htmlFor="ipad">1x iPad</Label>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div className="space-y-4">
              <div className="bg-gray-200 py-2 px-4 rounded-md">
                <h3 className="text-center font-medium">Leistungen</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="support"
                    checked={servicesOptions.support}
                    onCheckedChange={() => handleServicesToggle("support")}
                  />
                  <Label htmlFor="support">Kostenloser Support (11Uhr - min.23Uhr)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="website"
                    checked={servicesOptions.website}
                    onCheckedChange={() => handleServicesToggle("website")}
                  />
                  <Label htmlFor="website">Website: 99€ einmalige Zahlung</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="steuerberater"
                    checked={servicesOptions.steuerberater}
                    onCheckedChange={() => handleServicesToggle("steuerberater")}
                  />
                  <Label htmlFor="steuerberater">Kostenlose Steuerberater-Support</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fotoshooting"
                    checked={servicesOptions.fotoshooting}
                    onCheckedChange={() => handleServicesToggle("fotoshooting")}
                  />
                  <Label htmlFor="fotoshooting">Fotoshooting: Gratis* oder 499€ /Session</Label>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Drei Monate nach Go-Live fällt eine einmalige Gebühr i.H.v. 300€ an.
                Die TSE gilt für die gesamte Partnerschaft.
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline"
                className="flex items-center" 
                onClick={generatePDF}
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </Button>
              
              <Button 
                type="submit"
                className="allo-button"
              >
                Complete Contract
              </Button>
            </div>
          </form>
        </div>
        
        {/* Hidden contract for PDF generation */}
        <div className="hidden">
          <div ref={contractRef} className="bg-white p-8 max-w-[210mm]" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Contract Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#e19277' }}>allO</h1>
                <h2 className="text-xl font-bold">Angebot</h2>
              </div>
              <div className="bg-black text-amber-400 rounded-full p-3 text-center" style={{ width: '100px', height: '100px' }}>
                <div className="text-sm font-bold">Crazy Deal</div>
                <div className="text-xs">gültig bis</div>
                <div className="text-xs">31.03.2023</div>
              </div>
            </div>
            
            {/* Restaurant Information */}
            <div className="mb-6 space-y-1">
              <p><strong>Restaurant:</strong> {selectedCompany?.name}</p>
              <p><strong>Adresse:</strong> {restaurantData.address}</p>
              <p><strong>Ansprechpartner:</strong> {restaurantData.contactPerson}</p>
              <p><strong>Email:</strong> {restaurantData.email}</p>
              <p><strong>Mobile:</strong> {restaurantData.mobile}</p>
            </div>
            
            {/* Consultant Information */}
            <div className="border p-3 mb-6">
              <p><strong>Dein allO Berater:</strong> {alloBeratername}</p>
            </div>
            
            {/* Package Selection */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Wähle Dein Paket</h3>
            </div>
            
            <div className="mb-6">
              <div className="bg-black text-amber-400 py-2 px-2 mb-4 text-center">
                <h3>Wichtig: nur 9,9€/Monat in den ersten 3 Monaten!</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.name} className="border p-3 relative">
                    {pkg.isTopSeller && (
                      <div className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-xs">
                        Top Seller
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        checked={selectedPackage === pkg.name} 
                        readOnly 
                      />
                      <span className="ml-2 font-bold">{pkg.name}</span>
                    </div>
                    {pkg.features.map((feature, i) => (
                      <p key={i} className="text-sm">{feature}</p>
                    ))}
                    <div className="mt-2">
                      <span className="line-through text-gray-500">{pkg.originalPrice}</span>
                      {" "}
                      <span className="font-bold">{pkg.discountedPrice}</span>
                      <span className="text-sm">/Monat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Free Extras */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Wähle Deine kostenlosen Extras</h3>
            </div>
            
            <div className="mb-6 grid grid-cols-4 gap-2">
              {extras.map((extra) => (
                <div key={extra.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedExtras.includes(extra.id)} 
                    readOnly 
                  />
                  <span className="ml-2 text-sm">{extra.name}</span>
                </div>
              ))}
            </div>
            
            {/* Payment Options */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Wähle Deinen unglaublich günstigen Zahlungstarif</h3>
            </div>
            
            <div className="mb-6 bg-amber-100 p-3">
              {paymentOptions.map((option, i) => (
                <div key={option.id} className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    checked={selectedPayment === option.id} 
                    readOnly 
                  />
                  <span className="ml-2">{option.name}</span>
                  {i === 0 && selectedPayment === "option2" && <span className="ml-2">oder</span>}
                </div>
              ))}
              <div className="text-xs mt-2">
                <input type="checkbox" checked readOnly />
                <span className="ml-2">Gültig auch für Amex, Firmenkarten & internationale Karten</span>
              </div>
              <div className="text-xs">*die Gebühren werden auf den Endkunden umgelegt*</div>
            </div>
            
            {/* Self Order Options */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Mache Umsatz wie McDonald's</h3>
            </div>
            
            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selfOrderOptions.kiosk} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Self-order Kiosk: 59€ /Kiosk/Monat</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selfOrderOptions.tablet} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Kitchen Monitor: 59€ /Monat</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selfOrderOptions.bierhahnkamera} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Dirmeler Bierhanksystem: 59€ /Monat</span>
              </div>
            </div>
            
            {/* Hardware Package */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Kostenloses Hardware Paket</h3>
            </div>
            
            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={hardwareOptions.bonDrucker} 
                  readOnly 
                />
                <span className="ml-2 text-sm">2x Bon Drucker</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={hardwareOptions.alloGo} 
                  readOnly 
                />
                <span className="ml-2 text-sm">1x allO Go</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={hardwareOptions.iPad} 
                  readOnly 
                />
                <span className="ml-2 text-sm">1x iPad</span>
              </div>
            </div>
            
            {/* Services */}
            <div className="bg-gray-200 py-1 px-2 mb-4 text-center">
              <h3>Leistungen</h3>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={servicesOptions.support} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Kostenloser Support (11Uhr - min.23Uhr)</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={servicesOptions.website} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Website: 99€ einmalige Zahlung</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={servicesOptions.steuerberater} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Kostenlose Steuerberater-Support</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={servicesOptions.fotoshooting} 
                  readOnly 
                />
                <span className="ml-2 text-sm">Fotoshooting: Gratis* oder 499€ /Session</span>
              </div>
            </div>
            
            <div className="text-xs">
              Drei Monate nach Go-Live fällt eine einmalige Gebühr i.H.v. 300€ an.
              Die TSE gilt für die gesamte Partnerschaft.
            </div>
            
            <div className="mt-8 text-center">
              <p>Contract generated on {format(new Date(), 'dd.MM.yyyy')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Check size={18} className="mr-2 text-green-500" />
              Contract Created Successfully
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="mb-4">The contract has been created and saved successfully.</p>
            <p>Would you like to download the PDF or return to the homepage?</p>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={generatePDF}
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
            
            <Button 
              className="flex items-center"
              onClick={() => navigate('/')}
            >
              <Home size={16} className="mr-2" />
              Return to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateContract;
