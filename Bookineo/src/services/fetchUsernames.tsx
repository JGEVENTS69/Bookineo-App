import { supabase } from 'src/services/supabase';

interface User {
  id: string;
  username: string;
}

const fetchUsernames = async (creatorIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .in('id', creatorIds);

    if (error) throw error;

    const usernames: { [key: string]: string } = {};
    data.forEach((user: User) => {
      usernames[user.id] = user.username;
    });

    return usernames;
  } catch (error) {
    console.error('Erreur lors de la récupération des noms d\'utilisateur:', error);
    throw error;
  }
};

export default fetchUsernames;