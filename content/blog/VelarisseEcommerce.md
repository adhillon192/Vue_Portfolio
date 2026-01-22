---
title: "Building a Modern E-Commerce Platform for Artisan Leather Goods with Next.js, Supabase, and Shopify"
description:  Crafting a full-featured, type-safe e-commerce experience for Velarisse Leather using Next.js, TypeScript, Supabase for backend services, and Shopify for commerce infrastructure to showcase handcrafted leather goods with performance and elegance.
date: 2026-01-22
image: https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg? auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 8
author:   
  name:  Amardeep Dhillon
  avatar: 
    src: https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    alt: Amardeep Dhillon
---

## Introduction

In the world of artisan craftsmanship, the digital storefront needs to reflect the same quality and attention to detail as the handcrafted products it showcases. When building the Velarisse Leather e-commerce platform, the challenge was clear: create a sophisticated, performant online shopping experience that honors the brand's commitment to quality leather goods while delivering modern e-commerce functionality.

The solution?  A hybrid architecture combining the best of headless commerce and modern backend services. 

## Tech Stack & Architecture

The Velarisse website is built with a robust, type-safe technology stack centered around **TypeScript** (99.1% of the codebase), ensuring code reliability and developer productivity throughout the development process.

### Core Technologies

- **Next.js**:  Leveraging React's server-side rendering and static site generation for optimal performance
- **TypeScript**: Providing end-to-end type safety across components, API routes, and data models
- **Supabase**:  PostgreSQL database, authentication, and real-time capabilities
- **Shopify Storefront API**: Headless commerce engine powering the checkout and inventory management
- **Modern CSS Solutions**: Responsive design ensuring seamless experiences across all devices

### The Hybrid Architecture Approach

Rather than building everything from scratch or relying solely on a monolithic platform, I chose a **headless commerce architecture** that combines:

1. **Shopify** for the heavy lifting:  product management, inventory, payments, and order fulfillment
2. **Supabase** for custom features: user profiles, wishlists, product reviews, and blog content
3. **Next.js** as the orchestration layer: fetching data from both sources and delivering a unified experience

## Implementing Shopify Storefront API

### Why Shopify?

For an artisan leather goods brand, managing inventory, processing payments, and handling fulfillment are critical.  Rather than reinventing the wheel, Shopify provides: 

- ✅ **Battle-tested checkout**:  PCI compliance out of the box
- ✅ **Inventory management**: Real-time stock tracking across products
- ✅ **Payment processing**: Support for multiple payment methods
- ✅ **Order management**: Built-in tools for tracking and fulfillment

### Integration Strategy

The Shopify Storefront API allows complete control over the frontend while leveraging Shopify's backend: 

```typescript
// lib/shopify.ts
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const client = createStorefrontApiClient({
  storeDomain: process.env. NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN! ,
  apiVersion: '2024-01',
  publicAccessToken: process.env. NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!,
});

export async function getProducts() {
  const query = `
    query GetProducts {
      products(first:  20) {
        edges {
          node {
            id
            title
            description
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await client.request(query);
  
  if (errors) {
    throw new Error(errors[0].message);
  }
  
  return data.products;
}
```

### Type-Safe Shopify Integration

With TypeScript powering 99.1% of the codebase, I created comprehensive type definitions for all Shopify entities:

```typescript
// types/shopify.ts
export interface ShopifyProduct {
  id:  string;
  title: string;
  description: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: ShopifyImage[];
  variants:  ShopifyVariant[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  priceV2: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  selectedOptions:  {
    name: string;
    value: string;
  }[];
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}
```

### Cart Management with Shopify

One of the most powerful features is the Cart API, which handles complex cart operations:

```typescript
// lib/shopify/cart. ts
export async function createCart(variantId: string, quantity: number) {
  const mutation = `
    mutation CreateCart($variantId: ID!, $quantity: Int!) {
      cartCreate(
        input: {
          lines: [
            {
              merchandiseId: $variantId
              quantity: $quantity
            }
          ]
        }
      ) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...  on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const { data } = await client.request(mutation, {
    variables: { variantId, quantity }
  });
  
  return data.cartCreate.cart;
}
```

## Implementing Supabase Backend

### Why Supabase?

While Shopify handles commerce, Supabase powers the custom features that make Velarisse unique:

- 🔐 **Authentication**: User accounts with social login support
- 📊 **PostgreSQL Database**: Custom data models for reviews, wishlists, and blog posts
- 🔄 **Real-time Subscriptions**: Live inventory updates
- 🗄️ **Storage**: Customer-uploaded images for custom orders
- 🔒 **Row Level Security**: Fine-grained access control

### Database Schema Design

The Supabase PostgreSQL database stores custom data that complements Shopify: 

```typescript
// supabase/schema. sql
create table profiles (
  id uuid references auth. users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  shopify_product_id text not null,
  shopify_variant_id text,
  created_at timestamp with time zone default now(),
  unique(user_id, shopify_product_id, shopify_variant_id)
);

create table product_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  shopify_product_id text not null,
  rating integer check (rating >= 1 and rating <= 5),
  title text not null,
  content text not null,
  verified_purchase boolean default false,
  created_at timestamp with time zone default now()
);

create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  content text not null,
  image_url text,
  author_id uuid references profiles(id),
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Row Level Security Policies
alter table wishlists enable row level security;

create policy "Users can view their own wishlists"
  on wishlists for select
  using (auth. uid() = user_id);

create policy "Users can insert their own wishlists"
  on wishlists for insert
  with check (auth.uid() = user_id);
```

### Supabase Client Setup

Type-safe Supabase integration with auto-generated types:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL! ,
  process.env. NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

// Helper functions with full type safety
export async function getUserWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending:  false });
  
  if (error) throw error;
  return data;
}

export async function addToWishlist(
  userId: string, 
  productId: string, 
  variantId?:  string
) {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: userId,
      shopify_product_id:  productId,
      shopify_variant_id: variantId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### Authentication Flow

Supabase Auth provides a seamless user experience:

```typescript
// components/Auth/SignInForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React. FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase. auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the login link! ');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target. value)}
        placeholder="Your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </form>
  );
}
```

## Bridging Shopify and Supabase

### The Data Flow

The beauty of this architecture is how seamlessly data flows between systems:

1. **Product Display**: Fetch product data from Shopify Storefront API
2. **User Data**: Enrich with Supabase data (wishlists, reviews)
3. **Unified Experience**: Merge data in Next.js API routes or React components

```typescript
// app/products/[handle]/page.tsx
import { getProductByHandle } from '@/lib/shopify';
import { getProductReviews } from '@/lib/supabase';

export default async function ProductPage({ 
  params 
}: { 
  params: { handle: string } 
}) {
  // Fetch from Shopify
  const product = await getProductByHandle(params. handle);
  
  // Fetch from Supabase
  const reviews = await getProductReviews(product.id);
  
  return (
    <div>
      <ProductDetails product={product} />
      <ProductReviews reviews={reviews} productId={product.id} />
    </div>
  );
}
```

### Real-time Wishlist Sync

Supabase's real-time capabilities enable live updates:

```typescript
// hooks/useWishlist.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

export function useWishlist() {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (! user) return;

    // Initial fetch
    const fetchWishlist = async () => {
      const { data } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id);
      
      setWishlist(data || []);
    };

    fetchWishlist();

    // Real-time subscription
    const subscription = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWishlist((prev) => [...prev, payload. new]);
          } else if (payload.eventType === 'DELETE') {
            setWishlist((prev) => 
              prev.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { wishlist };
}
```

## Technical Challenges & Solutions

### Challenge 1: Syncing Inventory Between Systems

**Problem**: Shopify is the source of truth for inventory, but Supabase stores references to products. 

**Solution**:  Implemented a webhook system where Shopify notifies our Next.js API route of inventory changes: 

```typescript
// app/api/webhooks/shopify/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/shopify/webhooks';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const isValid = verifyShopifyWebhook(rawBody, request.headers);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
  }

  const product = JSON.parse(rawBody);
  
  // Update any cached data or trigger notifications
  await supabase
    .from('product_updates')
    .insert({
      shopify_product_id: product. id,
      event_type: 'inventory_update',
      data: product
    });

  return NextResponse.json({ received: true });
}
```

### Challenge 2: Type Safety Across Systems

**Problem**:  Shopify and Supabase have different type systems. 

**Solution**: Created a unified type layer with strict TypeScript interfaces:

```typescript
// types/index.ts
import { ShopifyProduct } from './shopify';
import { Database } from './supabase';

// Unified product type combining both systems
export interface EnrichedProduct extends ShopifyProduct {
  averageRating?:  number;
  reviewCount?: number;
  isInWishlist?: boolean;
}

// Helper to merge data
export function enrichProduct(
  shopifyProduct: ShopifyProduct,
  supabaseData: {
    reviews: Database['public']['Tables']['product_reviews']['Row'][];
    isInWishlist: boolean;
  }
): EnrichedProduct {
  const averageRating = supabaseData.reviews. length > 0
    ? supabaseData.reviews.reduce((sum, r) => sum + r.rating, 0) / 
      supabaseData.reviews.length
    : undefined;

  return {
    ... shopifyProduct,
    averageRating,
    reviewCount:  supabaseData.reviews.length,
    isInWishlist: supabaseData.isInWishlist
  };
}
```

### Challenge 3: Authentication State Management

**Problem**: Managing user sessions across Shopify checkout and custom features.

**Solution**: Implemented a hybrid approach using Supabase Auth for the main site and Shopify's customer API for checkout:

```typescript
// middleware. ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Attach user info to headers for API routes
  if (session?. user) {
    res.headers.set('x-user-id', session.user.id);
    res.headers.set('x-user-email', session.user.email || '');
  }

  return res;
}
```

## Performance Optimization

### Caching Strategy

With data coming from two sources, caching is critical:

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedProducts = unstable_cache(
  async () => {
    const products = await getProducts();
    return products;
  },
  ['products'],
  {
    revalidate: 3600, // 1 hour
    tags: ['shopify-products']
  }
);

// Revalidate on webhook
export async function revalidateProducts() {
  revalidateTag('shopify-products');
}
```

### Image Optimization

Leveraging Next.js Image component with Shopify CDN:

```typescript
// components/ProductImage.tsx
import Image from 'next/image';

export function ProductImage({ 
  src, 
  alt 
}: { 
  src:  string; 
  alt: string 
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={800}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
      loading="lazy"
    />
  );
}
```

## Results & Impact

The hybrid Shopify + Supabase architecture delivers:

- ⚡ **Sub-2s Page Loads**: Optimized bundle sizes and aggressive caching
- 🛒 **99.9% Checkout Uptime**: Shopify's reliable infrastructure
- 🔐 **Secure Authentication**: Supabase Auth with RLS policies
- 📱 **Mobile-First Design**: 60%+ of traffic from mobile devices
- 🔒 **Type Safety**: 99.1% TypeScript coverage
- 🎨 **Custom Features**: Reviews, wishlists, and blog powered by Supabase
- 💳 **Payment Flexibility**: Multiple payment methods via Shopify

## Lessons Learned

Building the Velarisse platform reinforced several key principles:

1. **Don't Reinvent Commerce**: Shopify's battle-tested checkout is worth the trade-offs
2. **Supabase for Custom Features**: Perfect complement for features Shopify doesn't handle
3. **Type Safety is Essential**: TypeScript catches integration bugs before production
4. **Webhooks are Your Friend**: Real-time sync between systems is critical
5. **Cache Aggressively**: Two data sources means smart caching strategies

## Future Enhancements

The platform is designed for growth:

- **Shopify Plus Features**: Advanced checkout customization
- **Supabase Edge Functions**: Custom business logic at the edge
- **AI-Powered Recommendations**: Product suggestions based on browsing history
- **Custom Order Portal**: Supabase-powered custom leather goods configurator
- **Analytics Dashboard**: Combined Shopify + Supabase data insights

## Conclusion

The Velarisse Leather e-commerce platform demonstrates that the best solution often combines multiple services.  By leveraging Shopify's commerce expertise and Supabase's developer-friendly backend, we created a platform that's both powerful and maintainable. 

This headless commerce approach offers the flexibility to create unique brand experiences while avoiding the complexity of building payment processing, inventory management, and auth systems from scratch. 

For artisan brands looking to establish their online presence, this hybrid architecture provides the best of both worlds:  proven commerce infrastructure and the flexibility to build custom features that set your brand apart. 

---

*Interested in building your own headless e-commerce platform? Check out the [Velarisse website repository](https://github.com/adhillon192/velarisse-website) to explore the implementation details.*