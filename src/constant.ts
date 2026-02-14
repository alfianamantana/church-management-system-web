export interface IBasicResponse {
    code: number;
    status: 'success' | 'error';
    message: IMessage;
}

export interface IAsset {
    id: number;
    name: string;
    description?: string;
    value?: number;
    acquisition_date?: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    location?: string;
    category?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface IMessage {
    id: string[];
    en: string[];
}

// Helper function to get message based on current language
export const getMessage = (message: IMessage): string => {
    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    const langKey = currentLang === 'id' ? 'id' : 'en';
    return message[langKey]?.[0] || message.en?.[0] || 'Unknown error';
};

// Currency configuration
export interface ICurrency {
    code: string;
    name: string;
    symbol: string;
    symbolPosition: 'before' | 'after';
}

export const CURRENCIES: ICurrency[] = [
    {
        code: 'IDR',
        name: 'Indonesian Rupiah',
        symbol: 'Rp',
        symbolPosition: 'before',
    },
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        symbolPosition: 'before',
    },
];

// Helper function to format currency
export const formatCurrency = (amount: number | string, currencyCode: string = 'IDR'): string => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode);
    if (!currency) return `${amount}`;

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `${amount}`;

    const formattedAmount = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numAmount);

    if (currency.symbolPosition === 'before') {
        return `${currency.symbol} ${formattedAmount}`;
    } else {
        return `${formattedAmount} ${currency.symbol}`;
    }
};

// Helper function to get currency by code
export const getCurrency = (code: string): ICurrency | undefined => {
    return CURRENCIES.find((c) => c.code === code);
};

// Default currency (can be changed based on church settings)
export const DEFAULT_CURRENCY = 'IDR';

export type UserRole = 'superadmin' | 'user';

export interface IMusician {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface IMember {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface ISchedule {
    id: number;
    service_name: string;
    scheduled_at: string;
    createdAt: string;
    updatedAt: string;
    serviceAssignments: IServiceAssignment[];
}

export interface IServiceAssignment {
    id: number;
    schedule_id: number;
    member_id: number;
    role_id: number;
    createdAt: string;
    updatedAt: string;
    member?: IMember;
    role?: IRole;
}

export interface IRole {
    id: number;
    role_name: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    unique_key: string;
    phone_number: string;
    subscribe_until: string | null;
    role: UserRole;
    subscribe_type: 'bibit' | 'bertumbuh' | 'full';
    is_verified: boolean;
    is_trial_account: boolean;
    is_main_account: boolean;
    createdAt: string;
    updatedAt: string;

    churches: IChurch[];
}

export interface IPagination {
    total: number;
    page: number;
}

export interface IEvent {
    id: number | string;
    title: string;
    start: string;
    end: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IJemaat {
    id: number;
    name: string;
    birth_date: string | Date;
    born_place: string;
    is_married: boolean;
    gender: 'male' | 'female';
    age: number;
    createdAt: string | Date;
    updatedAt: string | Date;

    // Field yang bisa bernilai null
    mom_id: number | null;
    dad_id: number | null;
    phone_number: string | null;
    baptism_date: string | Date | null;
    family_id: number | null;
    dad: IJemaat | null;
    mom: IJemaat | null;
    couple_id: number | null;
    couple: IJemaat | null;
    children: IJemaat[];
}

export interface ICategory {
    id: number;
    name: string;
    type: 'income' | 'expense';
    createdAt: string;
    updatedAt: string;
}

export interface IFamily {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    jemaats?: IJemaat[];
}

export interface ITransaction {
    id: number;
    date: string;
    category_id: number;
    amount: number | string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    category?: ICategory;
}

export interface IPriorityNeed {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IChurch {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    phone_number: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
