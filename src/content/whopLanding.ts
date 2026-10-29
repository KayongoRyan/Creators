/** Landing copy aligned with https://whop.com/ (reference layout). */

export const whopLanding = {
  metaLine: "Whop. Create or run businesses with AI",
  hero: {
    title: "The new economy.",
    subtitle: "Build businesses, run ads, get paid.",
  },
  economicIntelligence: {
    title: "The fastest path to your next dollar",
    lead: "Economic Intelligence is a decision-making system that tells business operators their next best move at every level.",
    suggestions: [
      "Recruit affiliates from your top 20 buyers",
      "Update ad campaign targeting to lower impression costs by 25%",
      "Add a buy button to the top of your website",
      "Win back 240 members who lapsed this quarter",
      "Retry 86 cards that failed this week",
      "Switch 120 monthly members to an annual plan",
      "Add a checkout bump 18% of buyers already take",
      "Sell the next course to 640 members who finished",
    ],
  },
  agentic: {
    title: "Run your business agentically",
    lead: "Everything you can do from your Whop dashboard can be run programmatically using the Whop CLI. Build a business, run ads, move money, and more, directly from your AI agent.",
    terminal: `$ whop
Last login: Sat Oct  3 16:35:37 on ttys003
(base) ➜ ~ whop
whop@0.22.0 — Build and manage Whop apps from your terminal.
API version: 2026-09-25

Usage: whop <command>

GET STARTED
  quickstart                 Start here — choose or create the business used by the CLI
  apps                       Build and deploy fully-hosted web apps (*.whop.site)
  upgrade                    Update the CLI to the latest version

COMMERCE
  products                   The things you sell. Each owns variants and a store page.
  waitlist-entries           Join waitlists and manage customer signups awaiting approval.
  variants                   Purchasable configurations of a product.
  plans                      Deprecated compatibility endpoints for variants.
  promo-codes                Discounts that creators configure for checkout.
  memberships                A customer's purchase of a variant, from checkout through cancellation.`,
  },
  markets: {
    title: "Thrive in competitive markets.",
    items: [
      {
        title: "Payments",
        body: "Global payment acceptance, invoicing, ACH, wires, and financing, out of the box.",
      },
      {
        title: "Ads",
        body: "Launch campaigns, generate new creatives, and see exactly where your ad spend goes.",
      },
      {
        title: "Trading",
        body: "Invest earnings in widely available on-chain markets.",
      },
      {
        title: "Accounts",
        body: "Handle KYC and compliance. Create sub-accounts for your platform.",
      },
      {
        title: "Cards",
        body: "Spend instantly from your balance, and issue cards to your team.",
      },
      {
        title: "Communication",
        body: "Communicate with customers, your team, and industry peers.",
      },
    ],
  },
  api: {
    title: "Power your platform from our API.",
    tabs: [
      {
        id: "checkout",
        label: "Checkout",
        description: "Accept payments in your app without sending customers elsewhere.",
        code: `import { WhopElements, Checkout, CheckoutElement }
  from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

type Props = { planId: string };

export default function CheckoutDemo(props: Props) {
  return (
    <WhopElements elements={elements}>
      <Checkout plan={props.planId}>
        <CheckoutElement />
      </Checkout>
    </WhopElements>
  );
}`,
      },
      {
        id: "wallet",
        label: "Wallet",
        description: "Let customers hold a balance, move money, and manage their assets.",
        code: `import {
  WhopElements, Wallet, Balances,
  BalanceElement, ListElement,
} from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

type Props = { accountId: string; accessToken: string };

export default function WalletDemo(props: Props) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...props}>
        <Balances>
          <BalanceElement />
          <ListElement />
        </Balances>
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "ads",
        label: "Ads",
        description: "Launch and report on campaigns from embedded elements.",
        code: `import { WhopElements, Ads, Reporting, ChartElement }
  from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

type Props = { accountId: string; accessToken: string };

export default function AdsDemo(props: Props) {
  return (
    <WhopElements elements={elements}>
      <Ads {...props}>
        <Reporting>
          <ChartElement />
        </Reporting>
      </Ads>
    </WhopElements>
  );
}`,
      },
      {
        id: "cards",
        label: "Cards",
        description: "Issue cards and let people spend straight from their balance.",
        code: `import { loadWhop } from "@whop/elements";
import {
  WhopElements, Wallet, Cards, WhopCardElement,
} from "@whop/elements-react";

const elements = loadWhop();
type Auth = { accountId: string; accessToken: string };
type Props = { auth: Auth; cardId: string };

export function CardsDemo({ auth, cardId }: Props) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...auth}>
        <Cards>
          <WhopCardElement cardId={cardId} hideAppleWalletButton />
        </Cards>
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "reports",
        label: "Reports",
        description: "Show a live report of every dollar moving through the business.",
        code: `import { WhopElements, Wallet, Reports, BalanceReportElement }
  from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

type Props = { accountId: string; accessToken: string };

export default function ReportsDemo(props: Props) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...props}>
        <Reports>
          <BalanceReportElement />
        </Reports>
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "convert",
        label: "Convert",
        description: "Let customers swap balances between currencies in place.",
        code: `import { loadWhop } from "@whop/elements";
import { WhopElements, Wallet, ConvertElement } from "@whop/elements-react";

const elements = loadWhop();

export function ConvertDemo(props: { accountId: string; accessToken: string }) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...props}>
        <ConvertElement />
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "deposit",
        label: "Deposit",
        description: "Add money to a balance without leaving your app.",
        code: `import { loadWhop } from "@whop/elements";
import { WhopElements, Wallet, DepositElement } from "@whop/elements-react";

const elements = loadWhop();

export function DepositDemo(props: { accountId: string; accessToken: string }) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...props}>
        <DepositElement amount="250" preferredMethodId="bank" />
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "withdraw",
        label: "Withdraw",
        description: "Move funds out to bank or external accounts.",
        code: `import { loadWhop } from "@whop/elements";
import { WhopElements, Wallet, WithdrawElement } from "@whop/elements-react";

const elements = loadWhop();

export function WithdrawDemo(props: { accountId: string; accessToken: string }) {
  return (
    <WhopElements elements={elements}>
      <Wallet {...props}>
        <WithdrawElement />
      </Wallet>
    </WhopElements>
  );
}`,
      },
      {
        id: "people",
        label: "People",
        description: "Track customers and cohorts with embedded analytics.",
        code: `import { WhopElements, Tracking, PeopleElement }
  from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

export default function PeopleDemo(props: { accountId: string; accessToken: string }) {
  return (
    <WhopElements elements={elements}>
      <Tracking {...props}>
        <PeopleElement />
      </Tracking>
    </WhopElements>
  );
}`,
      },
    ],
  },
  deploy: {
    title: "Deploy a business instantly.",
  },
  featured: {
    title: "Featured customers",
    names: [
      "Viral Coach",
      "The Ultimate Etsy Course",
      "Glass Factory",
      "Stock Dads",
      "Whop",
      "Woobie",
      "SkyAccess",
    ],
    spotlight: {
      name: "Viral Coach",
      body: "Daniel Iles is the founder of Viral Coach, an AI-powered SaaS platform that helps creators, coaches, and agencies generate, schedule, and publish viral short-form content across TikTok, Instagram, and YouTube.",
    },
  },
  mission: {
    title: "Our mission is to deliver everyone a sustainable income.",
    body: "Whop is built by builders and operators who pioneered internet markets. The average employee age is 25, and three-quarters of our team are ex-founders. We use our product daily and many of our team members run their own businesses on Whop.",
    press: "press@whop.com",
    support: "support@whop.com",
  },
} as const;
