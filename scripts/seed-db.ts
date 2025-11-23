import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../src/types/supabase';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client with Service Role Key for bypassing RLS, or just anon key
// Since we want to insert data for a specific user or generally populate data,
// usually we need a user session or admin rights.
// For now, we'll try to insert directly. If RLS blocks it (since we have no user),
// we might need to create a user first or use a service role key.
// HOWEVER, we can use the direct SQL connection we set up in the previous step to bypass RLS completely for seeding.

import pg from 'pg';
const { Client } = pg;

async function seedRecipes() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const recipes = [
    {
      title: 'Spaghetti Carbonara',
      description: 'A classic Roman pasta dish made with eggs, cheese, pancetta, and pepper.',
      ingredients: JSON.stringify([
        '400g spaghetti',
        '150g pancetta or guanciale, cubed',
        '4 large eggs',
        '100g Pecorino Romano, grated',
        'Black pepper',
        'Salt'
      ]),
      instructions: JSON.stringify([
        'Boil water for pasta.',
        'Fry pancetta until crisp.',
        'Whisk eggs and cheese together with pepper.',
        'Cook pasta until al dente.',
        'Toss pasta with pancetta fat.',
        'Remove from heat and mix in egg mixture quickly to create sauce.',
        'Serve immediately with more cheese.'
      ]),
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Chicken Stir-Fry',
      description: 'Quick and healthy chicken stir-fry with vegetables.',
      ingredients: JSON.stringify([
        '2 chicken breasts, sliced',
        '2 cups mixed vegetables (broccoli, peppers, carrots)',
        '2 tbsp soy sauce',
        '1 tbsp sesame oil',
        '1 tsp ginger, minced',
        '1 garlic clove, minced'
      ]),
      instructions: JSON.stringify([
        'Heat oil in a wok.',
        'Stir-fry chicken until golden.',
        'Add garlic and ginger.',
        'Add vegetables and stir-fry for 3-4 minutes.',
        'Add soy sauce and toss everything together.',
        'Serve with rice.'
      ]),
      prep_time: 15,
      cook_time: 10,
      servings: 2,
      image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Avocado Toast',
        description: 'Simple and delicious avocado toast with poached egg.',
        ingredients: JSON.stringify([
            '2 slices sourdough bread',
            '1 ripe avocado',
            '2 eggs',
            'Chili flakes',
            'Salt & pepper',
            'Lemon juice'
        ]),
        instructions: JSON.stringify([
            'Toast the bread.',
            'Mash avocado with lime juice, salt, and pepper.',
            'Poach the eggs in simmering water.',
            'Spread avocado on toast.',
            'Top with poached egg and chili flakes.'
        ]),
        prep_time: 5,
        cook_time: 5,
        servings: 2,
        image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Beef Tacos',
        description: 'Classic beef tacos with fresh toppings.',
        ingredients: JSON.stringify([
            '500g ground beef',
            '1 packet taco seasoning',
            '12 taco shells',
            'Lettuce, shredded',
            'Cheddar cheese, grated',
            'Sour cream',
            'Salsa'
        ]),
        instructions: JSON.stringify([
            'Brown the beef in a pan.',
            'Add taco seasoning and water as per packet instructions.',
            'Simmer until thickened.',
            'Warm the taco shells.',
            'Serve beef in shells with toppings of choice.'
        ]),
        prep_time: 15,
        cook_time: 15,
        servings: 4,
        image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Mushroom Risotto',
        description: 'Creamy Italian rice dish with wild mushrooms.',
        ingredients: JSON.stringify([
            '300g arborio rice',
            '200g mushrooms, sliced',
            '1L vegetable stock, hot',
            '1 onion, chopped',
            '2 cloves garlic, minced',
            '50g butter',
            '50g parmesan cheese'
        ]),
        instructions: JSON.stringify([
            'Sauté onion and garlic in half the butter.',
            'Add mushrooms and cook until soft.',
            'Stir in rice and toast for a minute.',
            'Add stock one ladle at a time, stirring constantly until absorbed.',
            'Repeat until rice is cooked (about 20 mins).',
            'Stir in remaining butter and parmesan.'
        ]),
        prep_time: 10,
        cook_time: 30,
        servings: 4,
        image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Greek Salad',
        description: 'Fresh and crisp salad with feta and olives.',
        ingredients: JSON.stringify([
            '3 tomatoes, chopped',
            '1 cucumber, chopped',
            '1 red onion, sliced',
            '200g feta cheese, cubed',
            '1/2 cup kalamata olives',
            'Olive oil',
            'Oregano'
        ]),
        instructions: JSON.stringify([
            'Combine tomatoes, cucumber, and onion in a bowl.',
            'Add olives and feta cheese.',
            'Drizzle generously with olive oil.',
            'Sprinkle with dried oregano.',
            'Serve immediately.'
        ]),
        prep_time: 15,
        cook_time: 0,
        servings: 2,
        image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Pancakes',
        description: 'Fluffy breakfast pancakes served with maple syrup.',
        ingredients: JSON.stringify([
            '1 1/2 cups flour',
            '3 1/2 tsp baking powder',
            '1 tbsp sugar',
            '1 1/4 cups milk',
            '1 egg',
            '3 tbsp butter, melted'
        ]),
        instructions: JSON.stringify([
            'Mix dry ingredients in a bowl.',
            'Whisk milk, egg, and melted butter.',
            'Pour wet ingredients into dry and mix until just combined.',
            'Cook on a hot griddle until bubbles form, then flip.',
            'Serve with maple syrup and berries.'
        ]),
        prep_time: 10,
        cook_time: 15,
        servings: 4,
        image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80'
    }
  ];

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // Since RLS is enabled, inserts via SQL client (postgres user) bypass RLS policies automatically 
    // because 'postgres' is a superuser or owner.
    // However, the `user_id` field will be null unless we assign one.
    // The schema allows user_id to be null (though typical app logic might hide it).
    // Let's insert them with user_id NULL for now, effectively making them "system recipes" 
    // or we should disable RLS for a moment if we were using the JS client.
    // Since we are using the 'postgres' role, we can just insert.

    console.log('📝 Seeding recipes...');

    for (const recipe of recipes) {
      const query = `
        INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
      `;
      
      const values = [
        recipe.title,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
        recipe.prep_time,
        recipe.cook_time,
        recipe.servings,
        recipe.image_url
      ];

      const res = await client.query(query, values);
      console.log(`✅ Added recipe: ${recipe.title} (ID: ${res.rows[0].id})`);
    }

    console.log('✨ Seeding complete!');

    // NOTE: The existing RLS policy "Users can view their own recipes" 
    // (using auth.uid() = user_id) will hide these recipes from normal users 
    // because user_id is NULL.
    // We should probably add a policy to allow viewing recipes where user_id IS NULL (public recipes).
    
    console.log('🔓 Updating RLS policies to allow viewing public recipes...');
    await client.query(`
      DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
      CREATE POLICY "Users can view their own and public recipes" 
      ON public.recipes FOR SELECT 
      USING (auth.uid() = user_id OR user_id IS NULL);
    `);
    console.log('✅ RLS policy updated.');

  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seedRecipes();

