
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ClosedLostReasonFormProps {
  meetingId: string;
  onComplete: () => void;
}

const ClosedLostReasonForm: React.FC<ClosedLostReasonFormProps> = ({ meetingId, onComplete }) => {
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
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
    console.log("Closed Lost Reason:", {
      meetingId,
      reason,
      otherReason: reason === "Other" ? otherReason : undefined
    });
    
    toast.success("Meeting outcome recorded successfully");
    onComplete();
  };
  
  return (
    <div className="allo-card w-full">
      <h2 className="text-xl font-semibold mb-6">Closed Lost Reason</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="closed-lost-reason">Reason <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={setReason}
              value={reason}
            >
              <SelectTrigger id="closed-lost-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Too sophisticated/modern">Too sophisticated/modern</SelectItem>
                <SelectItem value="Too expensive">Too expensive</SelectItem>
                <SelectItem value="Too many features">Too many features</SelectItem>
                <SelectItem value="No fit to the restaurant type">No fit to the restaurant type</SelectItem>
                <SelectItem value="No interest">No interest</SelectItem>
                <SelectItem value="Bad timing">Bad timing</SelectItem>
                <SelectItem value="Works black">Works black</SelectItem>
                <SelectItem value="Restaurant closed">Restaurant closed</SelectItem>
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

export default ClosedLostReasonForm;
