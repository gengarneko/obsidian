

PS4=$'\\\011%D{%s%6.}\011%x\011%I\011%N\011%e\011'

exec 3>&2 2>/tmp/zshstart.$$.log

setopt xtrace prompt_subst

  

# If you come from bash you might have to change your $PATH.

# export PATH=$HOME/bin:/usr/local/bin:$PATH

  

# Path to your oh-my-zsh installation.

export ZSH="$HOME/.oh-my-zsh"

  

# Set name of the theme to load --- if set to "random", it will

# load a random theme each time oh-my-zsh is loaded, in which case,

# to know which specific one was loaded, run: echo $RANDOM_THEME

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

ZSH_THEME="robbyrussell"

  

# Set list of themes to pick from when loading at random

# Setting this variable when ZSH_THEME=random will cause zsh to load

# a theme from this variable instead of looking in $ZSH/themes/

# If set to an empty array, this variable will have no effect.

# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

  

# Uncomment the following line to use case-sensitive completion.

# CASE_SENSITIVE="true"

  

# Uncomment the following line to use hyphen-insensitive completion.

# Case-sensitive completion must be off. _ and - will be interchangeable.

# HYPHEN_INSENSITIVE="true"

  

# Uncomment one of the following lines to change the auto-update behavior

# zstyle ':omz:update' mode disabled # disable automatic updates

# zstyle ':omz:update' mode auto # update automatically without asking

# zstyle ':omz:update' mode reminder # just remind me to update when it's time

  

# Uncomment the following line to change how often to auto-update (in days).

# zstyle ':omz:update' frequency 13

  

# Uncomment the following line if pasting URLs and other text is messed up.

# DISABLE_MAGIC_FUNCTIONS="true"

  

# Uncomment the following line to disable colors in ls.

# DISABLE_LS_COLORS="true"

  

# Uncomment the following line to disable auto-setting terminal title.

# DISABLE_AUTO_TITLE="true"

  

# Uncomment the following line to enable command auto-correction.

# ENABLE_CORRECTION="true"

  

# Uncomment the following line to display red dots whilst waiting for completion.

# You can also set it to another string to have that shown instead of the default red dots.

# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"

# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)

# COMPLETION_WAITING_DOTS="true"

  

# Uncomment the following line if you want to disable marking untracked files

# under VCS as dirty. This makes repository status check for large repositories

# much, much faster.

# DISABLE_UNTRACKED_FILES_DIRTY="true"

  

# Uncomment the following line if you want to change the command execution time

# stamp shown in the history command output.

# You can set one of the optional three formats:

# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"

# or set a custom format using the strftime function format specifications,

# see 'man strftime' for details.

# HIST_STAMPS="mm/dd/yyyy"

  

# Would you like to use another custom folder than $ZSH/custom?

# ZSH_CUSTOM=/path/to/new-custom-folder

  

# Which plugins would you like to load?

# Standard plugins can be found in $ZSH/plugins/

# Custom plugins may be added to $ZSH_CUSTOM/plugins/

# Example format: plugins=(rails git textmate ruby lighthouse)

# Add wisely, as too many plugins slow down shell startup.

plugins=(z git zsh-autosuggestions zsh-syntax-highlighting)

fpath+=${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions/src

source $ZSH/oh-my-zsh.sh

  

# User configuration

  

# export MANPATH="/usr/local/man:$MANPATH"

  

# You may need to manually set your language environment

# export LANG=en_US.UTF-8

  

# Preferred editor for local and remote sessions

# if [[ -n $SSH_CONNECTION ]]; then

# export EDITOR='vim'

# else

# export EDITOR='mvim'

# fi

  

# Compilation flags

# export ARCHFLAGS="-arch x86_64"

  

# Set personal aliases, overriding those provided by oh-my-zsh libs,

# plugins, and themes. Aliases can be placed here, though oh-my-zsh

# users are encouraged to define aliases within the ZSH_CUSTOM folder.

# For a full list of active aliases, run `alias`.

#

# Example aliases

# alias zshconfig="mate ~/.zshrc"

# alias ohmyzsh="mate ~/.oh-my-zsh"

  

# PATH

eval "$(starship init zsh)"

eval "$(fnm env --use-on-cd)"

  

# Alias

alias ip='curl ipinfo.io'

alias p='pnpm'

alias pi='pnpm i'

alias clnm='sudo find . -name "node_modules" -type d -prune -exec rm -rf '{}' +'

  

# Added by Windsurf

# windsurf

export PATH="/Users/theo/.codeium/windsurf/bin:$PATH"

alias code="Windsurf"

  

# -------------------------------------------------------------------------------------------------------------------------------------

  

# 定义一个函数，该函数将 fzf 用于选择目录并返回选定的目录路径

fzf_select_directory() {

fd -t d . --max-depth 1 | fzf

}

# 定义一个函数，该函数接受一个命令作为参数，并在选定目录上执行该命令

fzf_execute_command_on_directory() {

local selected_directory

selected_directory=$(fzf_select_directory)

[ -n "$selected_directory" ] && "$@" "$selected_directory"

}

  

alias fcd='fzf_execute_command_on_directory cd'

# alias fcode='fzf_execute_command_on_directory code'

alias fcode='fzf_execute_command_on_directory windsurf'

alias fopen='fzf_execute_command_on_directory open'

  

# Git

export LC_ALL=en_US.UTF-8

export LANG=en_US.UTF-8

alias git='LANG=en_GB git'

# git switch brach with fzf

alias gsf='git checkout $(git branch | fzf)'

  

# pnpm

export PNPM_HOME="/Users/theo/Library/pnpm"

case ":$PATH:" in

*":$PNPM_HOME:"*) ;;

*) export PATH="$PNPM_HOME:$PATH" ;;

esac

# pnpm end

  

# go

# [[ -s "/Users/theo/.gvm/scripts/gvm" ]] && source "/Users/theo/.gvm/scripts/gvm"

  

# export GOPATH=$HOME/go

# export GOROOT="$(brew --prefix golang)/libexec"

# export PATH="$PATH:${GOPATH}/bin:${GOROOT}/bin"

  

# youdao

alias yd='wd'

  

# --namespace=private-saas-test set image deployments/mark-web3d-deployment mark-web3d=

# bun completions

[ -s "/Users/theo/.bun/_bun" ] && source "/Users/theo/.bun/_bun"

  

# bun

export BUN_INSTALL="$HOME/.bun"

export PATH="$BUN_INSTALL/bin:$PATH"

  

# 查看个人提交的代码行数统计

git_stats_for_user() {

local username="$1"

git log --author="$username" --pretty=tformat: --numstat |

awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'

}

  

# 查看项目每个人提交的代码行数统计

git_stats_for_all_users() {

git log --format='%aN' | sort -u |

while read name; do

echo -en "$name\t"

git log --author="$name" --pretty=tformat: --numstat |

awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'

done

}

  

# 查询所有用户的提交总次数

git_total_commits_by_user() {

git log --pretty='%aN' | sort | uniq -c | sort -k1 -n -r

}

  

# bum

export BUM_INSTALL="$HOME/.bum"

export PATH="$BUM_INSTALL/bin:$PATH"

alias b="bun run"

  

# >>> conda initialize >>>

# !! Contents within this block are managed by 'conda init' !!

__conda_setup="$('/Users/theo/anaconda3/bin/conda' 'shell.zsh' 'hook' 2>/dev/null)"

if [ $? -eq 0 ]; then

eval "$__conda_setup"

else

if [ -f "/Users/theo/anaconda3/etc/profile.d/conda.sh" ]; then

. "/Users/theo/anaconda3/etc/profile.d/conda.sh"

else

export PATH="/Users/theo/anaconda3/bin:$PATH"

fi

fi

unset __conda_setup

  

# Disable conda auto-activation

conda config --set auto_activate_base false

# <<< conda initialize <<<

  

# BEGIN opam configuration

# This is useful if you're using opam as it adds:

# - the correct directories to the PATH

# - auto-completion for the opam binary

# This section can be safely removed at any time if needed.

[[ ! -r '/Users/theo/.opam/opam-init/init.zsh' ]] || source '/Users/theo/.opam/opam-init/init.zsh' >/dev/null 2>/dev/null

# END opam configuration

  

unsetopt xtrace

exec 2>&3 3>&-