import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  formatCurrency,
  calculateMonthlyPayment,
  calculateRequiredIncome,
} from "@/data/properties";

interface FinancialCalculatorProps {
  totalPrice: number;
  isBlurred?: boolean;
}

const FinancialCalculator = ({ totalPrice, isBlurred = false }: FinancialCalculatorProps) => {
  const [downpaymentPercent, setDownpaymentPercent] = useState(20);
  const [downpaymentMonths, setDownpaymentMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(7);
  const [loanTermYears, setLoanTermYears] = useState(20);

  const downpayment = totalPrice * (downpaymentPercent / 100);
  const loanAmount = totalPrice - downpayment;
  const monthlyDownpayment = downpayment / downpaymentMonths;
  const monthlyAmortization = calculateMonthlyPayment(
    loanAmount,
    interestRate,
    loanTermYears * 12
  );
  const requiredIncome = calculateRequiredIncome(monthlyAmortization);
  const totalPayment = downpayment + monthlyAmortization * loanTermYears * 12;

  const contentClass = isBlurred ? "blur-content" : "";

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-lg">Financial Calculator</h3>
      </div>

      {/* Inputs */}
      <div className="space-y-6 mb-8">
        {/* Downpayment Percent */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Downpayment</Label>
            <span className="text-sm font-medium text-accent">{downpaymentPercent}%</span>
          </div>
          <Slider
            value={[downpaymentPercent]}
            onValueChange={(v) => setDownpaymentPercent(v[0])}
            min={10}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Downpayment Term */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dpMonths">DP Term (Months)</Label>
            <Input
              id="dpMonths"
              type="number"
              value={downpaymentMonths}
              onChange={(e) => setDownpaymentMonths(Number(e.target.value) || 1)}
              min={1}
              max={60}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest">Interest Rate (%)</Label>
            <Input
              id="interest"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              step={0.5}
              min={0}
              max={20}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Loan Term</Label>
            <span className="text-sm font-medium text-accent">{loanTermYears} years</span>
          </div>
          <Slider
            value={[loanTermYears]}
            onValueChange={(v) => setLoanTermYears(v[0])}
            min={5}
            max={30}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 yrs</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className={`space-y-4 ${contentClass}`}>
        {/* Downpayment Breakdown */}
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <PiggyBank className="h-4 w-4" />
            <span>Downpayment Breakdown</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total DP ({downpaymentPercent}%)</p>
              <p className="font-semibold text-lg">{formatCurrency(downpayment)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monthly DP ({downpaymentMonths} mos)</p>
              <p className="font-semibold text-lg">{formatCurrency(monthlyDownpayment)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Amortization */}
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span>Monthly Amortization (Bank Loan)</span>
          </div>
          <p className="font-bold text-2xl text-primary">
            {formatCurrency(monthlyAmortization)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Loan Amount: {formatCurrency(loanAmount)} @ {interestRate}% for {loanTermYears} years
          </p>
        </div>

        {/* Required Income - HIGHLIGHTED */}
        <div className="stat-highlight animate-pulse-glow">
          <div className="flex items-center justify-center gap-2 text-success mb-2">
            <Wallet className="h-5 w-5" />
            <span className="font-semibold">REQUIRED MONTHLY INCOME</span>
          </div>
          <p className="font-bold text-3xl text-success">
            {formatCurrency(requiredIncome)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Based on 35% debt-to-income ratio
          </p>
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Contract Price</span>
            <span className="font-medium">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Total Payment (with interest)</span>
            <span className="font-medium">{formatCurrency(totalPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculator;
