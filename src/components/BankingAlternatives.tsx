import { Building2, ChevronDown, Copy, Globe2 } from 'lucide-react';

interface BankingAlternativesProps {
  onShowToast: (message: string) => void;
}

interface BankAccount {
  currency: string;
  label: string;
  accountHolder: string;
  accountNumber: string;
  swift: string;
  bankCode?: string;
  branchCode?: string;
  ach?: string;
  wire?: string;
  bankName: string;
  address: string;
  region: string;
  clearing?: string;
  instruction?: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    currency: 'CNH',
    label: 'Hong Kong dollar clearing',
    accountHolder: 'PLAYBEAT DIGITAL (PRIVATE) LIMITED',
    accountNumber: '63208426332',
    swift: 'CHASHKHHXXX',
    bankCode: '007',
    branchCode: '863',
    bankName: 'JP Morgan Chase HONG KONG BRANCH',
    address: 'The Quayside, 18/F Tower 1, 77 Hoi Bun Road, Kwun Tong, Hong Kong',
    region: 'HK',
  },
  {
    currency: 'THB',
    label: 'Thailand local transfers',
    accountHolder: 'PLAYBEAT DIGITAL (PRIVATE) LIMITED',
    accountNumber: '818394199001',
    swift: 'HSBCTHBKXXX',
    bankCode: '031',
    branchCode: '0001',
    bankName: 'The Hongkong and Shanghai Banking Corporation Limited, Bangkok Branch',
    address: 'HSBC Building, Level 4, 968 Rama IV Road, Silom, Bangrak, Bangkok 10500, Thailand',
    region: 'TH',
    clearing: 'RT-RPS (PromptPay), RTGS (Bahtnet), RTGS (BOOK), ACH',
    instruction: 'For Bahtnet or BOOK transfers, enter “AIHK Markets Limited” as the account holder name. Otherwise the payment will fail.',
  },
  {
    currency: 'USD',
    label: 'United States ACH & wire',
    accountHolder: 'PLAYBEAT DIGITAL (PRIVATE) LIMITED',
    accountNumber: '30000001060850',
    swift: 'CHASUS33',
    ach: '028000024',
    wire: '021000021',
    bankName: 'JP MORGAN CHASE BANK, N.A.',
    address: '383 Madison Avenue, New York, NY 10179, United States',
    region: 'US',
  },
  {
    currency: 'AUD · CAD · CNH · EUR · GBP · HKD · JPY · NZD · SGD · USD',
    label: 'Multi-currency Singapore account',
    accountHolder: 'PLAYBEAT DIGITAL (PRIVATE) LIMITED',
    accountNumber: '13900011602',
    swift: 'CITISGSG',
    bankCode: '7214',
    branchCode: '001',
    bankName: 'CITIBANK N.A. SINGAPORE',
    address: '8 Marina View, 17-00 Asia Square Tower 1, Singapore 018960',
    region: 'SG',
  },
];

export function BankingAlternatives({ onShowToast }: BankingAlternativesProps) {
  const copyValue = (label: string, value: string) => {
    if (navigator.clipboard) void navigator.clipboard.writeText(value);
    onShowToast(`${label} copied.`);
  };

  return (
    <section className="rounded-2xl border border-[#2f8bff]/25 bg-[#06142f]/70 p-3.5" aria-labelledby="bank-alternatives-title">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1ea0ff]/10 text-[#79c4ff]">
          <Globe2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 id="bank-alternatives-title" className="text-xs font-extrabold text-white">International bank alternatives</h3>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#9fb1d2]">Choose a supported currency and include your Playbeat order ID in the transfer reference. Manual transfers are verified before fulfillment.</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {BANK_ACCOUNTS.map((account) => (
          <details key={account.accountNumber} className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#020a20]/65">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-left">
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-extrabold text-[#ffe074]">{account.currency}</span>
                <span className="mt-0.5 block truncate text-[10px] text-[#9fb1d2]">{account.label} · {account.region}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#79c4ff] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-white/[0.08] p-3">
              <dl className="space-y-2 text-[10.5px] leading-relaxed">
                {[
                  ['Account holder', account.accountHolder],
                  ['Account number', account.accountNumber],
                  ['SWIFT / BIC', account.swift],
                  ['Bank code', account.bankCode],
                  ['Branch code', account.branchCode],
                  ['ACH routing', account.ach],
                  ['Wire routing', account.wire],
                  ['Bank', account.bankName],
                  ['Bank address', account.address],
                  ['Clearing system', account.clearing],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[92px_1fr] gap-2">
                    <dt className="text-[#7f92b4]">{label}</dt>
                    <dd className="break-words font-medium text-[#e2ebfb]">{value}</dd>
                  </div>
                ))}
              </dl>
              {account.instruction && (
                <p className="mt-3 rounded-lg border border-[#ffab00]/25 bg-[#ffab00]/10 p-2.5 text-[10px] leading-relaxed text-[#ffe0a3]">{account.instruction}</p>
              )}
              <button
                type="button"
                onClick={() => copyValue(`${account.currency} account number`, account.accountNumber)}
                className="mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[#2f8bff]/35 bg-[#0b214c]/70 px-3 text-[10px] font-bold text-[#b9dcff] hover:border-[#69baff]"
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
                Copy account number
              </button>
            </div>
          </details>
        ))}
      </div>

      <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-[#7f92b4]">
        <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#79c4ff]" aria-hidden="true" />
        Bank fees and intermediary-bank charges may apply. Submit the transfer reference in the manual-payment form after payment.
      </p>
    </section>
  );
}
