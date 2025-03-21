import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Download, Printer, Check, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SignatureCanvas from 'react-signature-canvas';

interface PackageOption {
  name: string;
  originalPrice: string;
  discountedPrice: string;
  features: string[];
  isTopSeller?: boolean;
}

interface ExtraOption {
  id: string;
  name: string;
}

interface PaymentOption {
  id: string;
  name: string;
  rates: {
    percentage: string;
    fee: string;
    type?: string;
  }
}

// Form validation schema
const formSchema = z.object({
  companyName: z.string().min(1, "Firmenname ist erforderlich"),
  address: z.string().min(1, "Adresse ist erforderlich"),
  contactPerson: z.string().min(1, "Ansprechpartner ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  mobile: z.string().min(1, "Mobilnummer ist erforderlich"),
  alloBeratername: z.string().min(1, "allO Berater Name ist erforderlich"),
  expectedCardVolume: z.string().optional(),
  remarks: z.string().optional(),
  
  // SEPA fields
  accountHolder: z.string().optional(),
  accountAddress: z.string().optional(),
  iban: z.string().optional(),
  goLiveDate: z.string().optional(),
  
  signerName: z.string().optional(),
  signatureDate: z.string().optional(),
});

const CreateContract: React.FC = () => {
  const navigate = useNavigate();
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [countryCode, setCountryCode] = useState("+49");
  const [onboardingType, setOnboardingType] = useState<string>("");

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      address: "",
      contactPerson: "",
      email: "",
      mobile: "",
      alloBeratername: "",
      expectedCardVolume: "",
      remarks: "",
      accountHolder: "",
      accountAddress: "",
      iban: "",
      goLiveDate: "",
      signerName: "",
      signatureDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });
  
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
  
  const [selfOrderOptions, setSelOrderOptions] = useState({
    kiosk: false,
    kioskQuantity: 1,
    tablet: false,
    tabletQuantity: 1,
    tabletOrdering: false,
    tabletOrderingQuantity: 1,
    bierhahnkamera: false
  });
  
  const [hardwareOptions, setHardwareOptions] = useState({
    bonDrucker: false,
    alloGo: false,
    iPad: false
  });
  
  const [servicesOptions, setServicesOptions] = useState({
    support: true,
    steuerberater: true,
    website: false,
    fotoshooting: false
  });
  
  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };
  
  const handleHardwareToggle = (option: keyof typeof hardwareOptions) => {
    setHardwareOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleServicesToggle = (option: keyof typeof servicesOptions) => {
    setServicesOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleSelfOrderToggle = (option: keyof typeof selfOrderOptions) => {
    if (option === 'kioskQuantity' || option === 'tabletQuantity' || option === 'tabletOrderingQuantity') return;
    
    setSelOrderOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleQuantityChange = (option: 'kioskQuantity' | 'tabletQuantity' | 'tabletOrderingQuantity', value: number) => {
    if (value >= 1 && value <= 99) {
      setSelOrderOptions(prev => ({
        ...prev,
        [option]: value
      }));
    }
  };
  
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
  
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedPackage) {
      toast.error("Bitte wählen Sie ein Paket");
      return;
    }
    
    if (!selectedPayment) {
      toast.error("Bitte wählen Sie einen Zahlungstarif");
      return;
    }
    
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Bitte unterschreiben Sie das Formular");
      return;
    }
    
    // In a real app, we would save the signature as an image
    const signatureDataUrl = signatureRef.current.toDataURL();
    console.log('Signature data URL:', signatureDataUrl);
    
    console.log("Form data:", data);
    console.log("Selected package:", selectedPackage);
    console.log("Selected extras:", selectedExtras);
    console.log("Selected payment:", selectedPayment);
    console.log("Self-order options:", selfOrderOptions);
    console.log("Hardware options:", hardwareOptions);
    console.log("Services options:", servicesOptions);
    console.log("Onboarding type:", onboardingType);
    
    setShowSuccessDialog(true);
  };
  
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Restaurant Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Firmenname</FormLabel>
                        <FormControl>
                          <Input placeholder="Firmenname eingeben" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Restaurant Adresse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ansprechpartner</FormLabel>
                          <FormControl>
                            <Input placeholder="Name des Ansprechpartners" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email Adresse" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
                                  {countryCode}
                                </span>
                                <Input 
                                  className="rounded-l-none"
                                  placeholder="Mobilnummer" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="alloBeratername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dein allO Berater</FormLabel>
                        <FormControl>
                          <Input placeholder="Dein Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Wähle Dein Paket</h3>
                </div>
                
                <div className="bg-black text-amber-400 py-3 px-4 rounded-md text-center font-medium mb-4">
                  Wichtig: nur 9,9€/Monat in den ersten 3 Monaten!
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.name}
                      className={`relative border rounded-md p-4 text-center ${selectedPackage === pkg.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      {pkg.isTopSeller && (
                        <div className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-xs transform rotate-12">
                          <span>Top</span>
                          <span>Seller</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <Checkbox 
                          id={`package-${pkg.name}`}
                          checked={selectedPackage === pkg.name}
                          onCheckedChange={() => setSelectedPackage(selectedPackage === pkg.name ? "" : pkg.name)}
                        />
                        <Label htmlFor={`package-${pkg.name}`} className="text-lg font-medium">{pkg.name}</Label>
                      </div>
                      
                      <div className="mb-3 flex flex-col items-center">
                        <div className="text-sm">TSE Kasse</div>
                        <div className="text-sm">unbegrenzte Lizenzen</div>
                        <div className="text-sm">{pkg.features[2]}</div>
                      </div>
                      
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="line-through text-gray-500">{pkg.originalPrice}</span>
                        <span className="font-bold">{pkg.discountedPrice}</span>
                        <span className="text-sm text-gray-600">/Monat</span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">*Monatlich kündbar</div>
                    </div>
                  ))}
                </div>
              </div>
              
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
                      />
                      <Label htmlFor={`extra-${extra.id}`}>{extra.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Wähle Deinen unglaublich günstigen Zahlungstarif</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-100 p-4 rounded-md">
                  <div className="border rounded-md p-3 flex items-center space-x-3 bg-white">
                    <Checkbox 
                      id="payment-option1"
                      checked={selectedPayment === "option1"}
                      onCheckedChange={() => setSelectedPayment(selectedPayment === "option1" ? "" : "option1")}
                    />
                    <Label htmlFor="payment-option1">0.79% + 0.08€</Label>
                  </div>
                  
                  <div className="border rounded-md p-3 bg-white">
                    <div className="flex items-center space-x-3 mb-1">
                      <Checkbox 
                        id="payment-option2"
                        checked={selectedPayment === "option2"}
                        onCheckedChange={() => setSelectedPayment(selectedPayment === "option2" ? "" : "option2")}
                      />
                      <Label htmlFor="payment-option2">Debit / Kredit</Label>
                    </div>
                    <div className="pl-6 text-sm">Debit: 0.49% + 0.08€</div>
                    <div className="pl-6 text-sm">Kredit: 0.99% + 0.08€</div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-center items-center space-x-2 mt-2">
                    <Checkbox id="cardTypes" checked={true} disabled />
                    <Label htmlFor="cardTypes" className="text-sm">Gültig auch für Amex, Firmenkarten & internationale Karten</Label>
                  </div>
                  <div className="md:col-span-2 text-xs text-gray-500 text-center">
                    *die Gebühren werden auf den Endkunden umgelegt*
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Mache Umsatz wie McDonald's</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="self-order-kiosk"
                        checked={selfOrderOptions.kiosk}
                        onCheckedChange={() => handleSelfOrderToggle("kiosk")}
                      />
                      <Label htmlFor="self-order-kiosk">Self-order Kiosk: 59€ /Kiosk/Monat</Label>
                    </div>
                    {selfOrderOptions.kiosk && (
                      <div className="flex items-center">
                        <Label htmlFor="kiosk-quantity" className="mr-2 text-sm">Anzahl:</Label>
                        <Input 
                          id="kiosk-quantity"
                          type="number" 
                          min="1" 
                          max="99"
                          className="w-16 h-8 text-center"
                          value={selfOrderOptions.kioskQuantity}
                          onChange={(e) => handleQuantityChange('kioskQuantity', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="kitchen-monitor"
                        checked={selfOrderOptions.tablet}
                        onCheckedChange={() => handleSelfOrderToggle("tablet")}
                      />
                      <Label htmlFor="kitchen-monitor">Kitchen Monitor: 59€ /Monat</Label>
                    </div>
                    {selfOrderOptions.tablet && (
                      <div className="flex items-center">
                        <Label htmlFor="tablet-quantity" className="mr-2 text-sm">Anzahl:</Label>
                        <Input 
                          id="tablet-quantity"
                          type="number" 
                          min="1" 
                          max="99"
                          className="w-16 h-8 text-center"
                          value={selfOrderOptions.tabletQuantity}
                          onChange={(e) => handleQuantityChange('tabletQuantity', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tablet-ordering"
                        checked={selfOrderOptions.tabletOrdering}
                        onCheckedChange={() => handleSelfOrderToggle("tabletOrdering")}
                      />
                      <Label htmlFor="tablet-ordering">Tablet Ordering: 19€ /Tablet/Monat</Label>
                    </div>
                    {selfOrderOptions.tabletOrdering && (
                      <div className="flex items-center">
                        <Label htmlFor="ordering-quantity" className="mr-2 text-sm">Anzahl:</Label>
                        <Input 
                          id="ordering-quantity"
                          type="number" 
                          min="1" 
                          max="99"
                          className="w-16 h-8 text-center"
                          value={selfOrderOptions.tabletOrderingQuantity}
                          onChange={(e) => handleQuantityChange('tabletOrderingQuantity', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bierhahnkamera"
                      checked={selfOrderOptions.bierhahnkamera}
                      onCheckedChange={() => handleSelfOrderToggle("bierhahnkamera")}
                    />
                    <Label htmlFor="bierhahnkamera">Dirmeler Bierhanksystem: 59€ /Monat</Label>
                  </div>
                </div>
              </div>
              
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
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Onboarding Type</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="online-onboarding"
                      checked={onboardingType === "online"}
                      onCheckedChange={() => setOnboardingType(onboardingType === "online" ? "" : "online")}
                    />
                    <Label htmlFor="online-onboarding">Online Onboarding</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="onsite-onboarding"
                      checked={onboardingType === "onsite"}
                      onCheckedChange={() => setOnboardingType(onboardingType === "onsite" ? "" : "onsite")}
                    />
                    <Label htmlFor="onsite-onboarding">Onsite Onboarding</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Anmerkungen</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Weitere Informationen oder Anmerkungen"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedCardVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Card Volume (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="z.B. 50000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">SEPA-Lastschrift</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accountHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kontoinhaber/in</FormLabel>
                        <FormControl>
                          <Input placeholder="Name des Kontoinhabers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse des Kontoinhabers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN</FormLabel>
                        <FormControl>
                          <Input placeholder="DE00 0000 0000 0000 0000 00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="goLiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voraussichtlicher Go-Live Datum</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-200 py-2 px-4 rounded-md">
                  <h3 className="text-center font-medium">Unterschrift</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Vollständiger Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="signatureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Datum</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border border-gray-300 rounded-md p-2">
                  <div className="bg-gray-50 border-b border-gray-200 p-2 mb-2 flex justify-between items-center">
                    <span className="text-sm">Unterschrift</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={clearSignature}
                    >
                      Löschen
                    </Button>
                  </div>
                  <div className="h-[200px] bg-white border border-gray-100 rounded touch-none">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'w-full h-full'
                      }}
                    />
                  </div>
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
          </Form>
        </div>
        
        <div className="hidden">
          <div ref={contractRef} className="bg-white p-8 max-w-[210mm]" style={{ fontFamily: 'Arial, sans-serif' }}>
            
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
            
            <div className="mb-6 space-y-1">
              <p><strong>Restaurant:</strong> {form.getValues().companyName}</p>
              <p><strong>Adresse:</strong> {form.getValues().address}</p>
              <p><strong>Ansprechpartner:</strong> {form.getValues().contactPerson}</p>
              <p><strong>Email:</strong> {form.getValues().email}</p>
              <p><strong>Mobile:</strong> {countryCode} {form.getValues().mobile}</p>
            </div>
            
            <div className="border p-3 mb-6">
              <p>
