
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ClosedWonReasonFormProps {
  meetingId: string;
  onComplete: () => void;
}

const ClosedWonReasonForm: React.FC<ClosedWonReasonFormProps> = ({ meetingId, onComplete }) => {
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [posCompetitor, setPosCompetitor] = useState<string>("");
  const [paymentCompetitor, setPaymentCompetitor] = useState<string>("");
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    
    if (reason === "Other" && !otherReason) {
      toast.error("Please provide details for the other reason");
      return;
    }
    
    // In a real app, you would submit this data to your API
    console.log("Closed Won Reason:", {
      meetingId,
      reason,
      otherReason: reason === "Other" ? otherReason : undefined,
      posCompetitor,
      paymentCompetitor
    });
    
    toast.success("Meeting outcome recorded successfully");
    onComplete();
  };
  
  return (
    <div className="allo-card w-full">
      <h2 className="text-xl font-semibold mb-6">Closed Won Reason</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="closed-won-reason">Reason <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={setReason}
              value={reason}
            >
              <SelectTrigger id="closed-won-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Specific Features">Specific Features</SelectItem>
                <SelectItem value="Attractive Pricing">Attractive Pricing</SelectItem>
                <SelectItem value="Sales Manager Skills">Sales Manager Skills</SelectItem>
                <SelectItem value="Integrated Payment">Integrated Payment</SelectItem>
                <SelectItem value="Integrations">Integrations</SelectItem>
                <SelectItem value="allO Go">allO Go</SelectItem>
                <SelectItem value="Invoice Tool">Invoice Tool</SelectItem>
                <SelectItem value="Recommendation from Existing Partner">Recommendation from Existing Partner</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="other-reason">Other Reason <span className="text-red-500">*</span></Label>
              <Input 
                id="other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please specify"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="pos-competitor">POS Competitor</Label>
            <Select 
              onValueChange={setPosCompetitor}
              value={posCompetitor}
            >
              <SelectTrigger id="pos-competitor">
                <SelectValue placeholder="Select a POS competitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lightspeed">Lightspeed</SelectItem>
                <SelectItem value="Toast">Toast</SelectItem>
                <SelectItem value="Square">Square</SelectItem>
                <SelectItem value="Clover">Clover</SelectItem>
                <SelectItem value="TouchBistro">TouchBistro</SelectItem>
                <SelectItem value="Revel">Revel</SelectItem>
                <SelectItem value="Aloha">Aloha</SelectItem>
                <SelectItem value="Lavu">Lavu</SelectItem>
                <SelectItem value="Loyverse">Loyverse</SelectItem>
                <SelectItem value="Custom Solution">Custom Solution</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-competitor">Payment Competitor</Label>
            <Select 
              onValueChange={setPaymentCompetitor}
              value={paymentCompetitor}
            >
              <SelectTrigger id="payment-competitor">
                <SelectValue placeholder="Select a payment competitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="Square">Square</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Adyen">Adyen</SelectItem>
                <SelectItem value="WorldPay">WorldPay</SelectItem>
                <SelectItem value="Braintree">Braintree</SelectItem>
                <SelectItem value="Authorize.net">Authorize.net</SelectItem>
                <SelectItem value="Shopify Payments">Shopify Payments</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" className="allo-button">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClosedWonReasonForm;
