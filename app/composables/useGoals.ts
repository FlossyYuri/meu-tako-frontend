import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeToGoalRequest,
  GoalContribution,
  GoalWithContributions,
  GoalProgress,
} from '~/types';

export const useGoals = () => {
  const goalsStore = useGoalsStore();
  const { success, error: showError } = useNotifications();

  // Buscar todas as metas
  const fetchGoals = async () => {
    try {
      return await goalsStore.fetchGoals();
    } catch (err: any) {
      showError('Erro ao carregar metas', err?.message);
      throw err;
    }
  };

  // Buscar meta por ID
  const getGoal = async (goalId: string) => {
    try {
      return await goalsStore.getGoalById(goalId);
    } catch (err: any) {
      showError('Erro ao carregar meta', err?.message);
      throw err;
    }
  };

  // Criar nova meta
  const createGoal = async (data: CreateGoalRequest) => {
    try {
      const goal = await goalsStore.createGoal(data);
      success('Meta criada com sucesso!');
      return goal;
    } catch (err: any) {
      showError('Erro ao criar meta', err?.message);
      throw err;
    }
  };

  // Atualizar meta
  const updateGoal = async (goalId: string, data: UpdateGoalRequest) => {
    try {
      const goal = await goalsStore.updateGoal(goalId, data);
      success('Meta atualizada com sucesso!');
      return goal;
    } catch (err: any) {
      showError('Erro ao atualizar meta', err?.message);
      throw err;
    }
  };

  // Excluir meta
  const deleteGoal = async (goalId: string) => {
    try {
      await goalsStore.deleteGoal(goalId);
      success('Meta excluída com sucesso!');
      return true;
    } catch (err: any) {
      showError('Erro ao excluir meta', err?.message);
      throw err;
    }
  };

  // Contribuir para meta
  const contributeToGoal = async (
    goalId: string,
    data: ContributeToGoalRequest
  ) => {
    try {
      const contribution = await goalsStore.contributeToGoal(goalId, data);
      success('Contribuição registrada com sucesso!');
      return contribution;
    } catch (err: any) {
      showError('Erro ao contribuir para meta', err?.message);
      throw err;
    }
  };

  // Buscar contribuições de uma meta
  const getGoalContributions = async (goalId: string) => {
    try {
      return await goalsStore.getGoalContributions(goalId);
    } catch (err: any) {
      showError('Erro ao carregar contribuições', err?.message);
      throw err;
    }
  };

  // Buscar meta com contribuições
  const getGoalWithContributions = async (goalId: string) => {
    try {
      return await goalsStore.getGoalWithContributions(goalId);
    } catch (err: any) {
      showError('Erro ao carregar detalhes da meta', err?.message);
      throw err;
    }
  };

  // Buscar progresso da meta
  const getGoalProgress = async (goalId: string) => {
    try {
      return await goalsStore.getGoalProgress(goalId);
    } catch (err: any) {
      showError('Erro ao carregar progresso da meta', err?.message);
      throw err;
    }
  };

  // Calcular estatísticas das metas
  const getGoalsStats = (goals: Goal[]) => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;
    const completedGoals = goals.filter((g) => g.is_completed).length;
    const totalTargetAmount = goals.reduce(
      (sum, g) => sum + g.target_amount,
      0
    );
    const totalCurrentAmount = goals.reduce(
      (sum, g) => sum + g.current_amount,
      0
    );
    const averageProgress =
      totalGoals > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress: Math.round(averageProgress * 100) / 100,
    };
  };

  // Filtrar metas por status
  const filterGoalsByStatus = (
    goals: Goal[],
    status: 'active' | 'inactive' | 'completed' | 'expired'
  ) => {
    switch (status) {
      case 'active':
        return goals.filter(
          (g) => g.status === 'active' && !g.is_completed && !g.is_expired
        );
      case 'inactive':
        return goals.filter((g) => g.status === 'inactive');
      case 'completed':
        return goals.filter((g) => g.is_completed);
      case 'expired':
        return goals.filter((g) => g.is_expired);
      default:
        return goals;
    }
  };

  // Ordenar metas
  const sortGoals = (
    goals: Goal[],
    sortBy:
      | 'title'
      | 'progress'
      | 'target_amount'
      | 'current_amount'
      | 'end_date' = 'end_date',
    order: 'asc' | 'desc' = 'asc'
  ) => {
    return [...goals].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'progress':
          aValue = (a.current_amount / a.target_amount) * 100;
          bValue = (b.current_amount / b.target_amount) * 100;
          break;
        case 'target_amount':
          aValue = a.target_amount;
          bValue = b.target_amount;
          break;
        case 'current_amount':
          aValue = a.current_amount;
          bValue = b.current_amount;
          break;
        case 'end_date':
          aValue = new Date(a.end_date).getTime();
          bValue = new Date(b.end_date).getTime();
          break;
        default:
          return 0;
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  return {
    // Store state
    goals: computed(() => goalsStore.goals),
    isLoading: computed(() => goalsStore.isLoading),
    error: computed(() => goalsStore.error),

    // Actions
    fetchGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getGoalContributions,
    getGoalWithContributions,
    getGoalProgress,

    // Utilities
    getGoalsStats,
    filterGoalsByStatus,
    sortGoals,
    clearError: goalsStore.clearError,
  };
};
