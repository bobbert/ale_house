require 'twitter_oauth'

class AuthorizationsController < ApplicationController

  def login
    twitter_client = TwitterOAuth::Client.new(:consumer_key => TWITTER_CONSUMER_KEY, :consumer_secret => TWITTER_CONSUMER_SECRET)

    if !returning_from_twitter?
      request_token = twitter_client.request_token(:oauth_callback => url_for(:login))
      session[:request_token]         = request_token.token
      session[:request_token_secret]  = request_token.secret
      redirect_to request_token.authorize_url    
    else
      twitter_client.authorize(
        session[:request_token],
        session[:request_token_secret],
        :oauth_verifier => params[:oauth_verifier]
      )
      session.delete(:request_token)
      session.delete(:request_token_secret)
      
      if true #twitter_client.authorized? && list_members(twitter_client).include?(twitter_client.info['screen_name'])
        session[:user] = twitter_client.info
      end

      redirect_to root_path 
    end
  end

  def list_members(twitter_client)
    return twitter_client.list_members(LIST_OWNER, LIST_NAME)['users'].map{|info| info['screen_name']}
  end

  def logout
    reset_session
    redirect_to root_path
  end

  def index

  end

  private
  
    def returning_from_twitter?
      params[:oauth_verifier] && session[:request_token]
    end
end
