from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import Counter
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

def get_message_text(messages):
    return " ".join([message.message for message in messages if (message.speaker == "You")])

def sentiment_scores(sentence): # From Geeks for Geeks
    # Create a SentimentIntensityAnalyzer object.
    sid_obj = SentimentIntensityAnalyzer()

    # polarity_scores method of SentimentIntensityAnalyzer object gives a sentiment dictionary.
    # which contains pos, neg, neu, and compound scores.
    sentiment_dict = sid_obj.polarity_scores(sentence)
    
    if   sentiment_dict['compound'] >=  0.05: return "Positive"
    elif sentiment_dict['compound'] <= -0.05: return "Negative"
    else:                                     return "Neutral"
    
def get_topics(text): # From freeCodeCamp
    
    # Initialize english stopwords
    english_stopwords = stopwords.words("english")

    #convert article to tokens
    tokens = word_tokenize(text)

    #extract alpha words and convert to lowercase
    alpha_lower_tokens = [word.lower() for word in tokens if word.isalpha()]

    #remove stopwords
    alpha_no_stopwords = [word for word in alpha_lower_tokens if word not in english_stopwords]

    #Count word
    BoW = Counter(alpha_no_stopwords)

    #3 Most common words
    most_common = BoW.most_common(3)
    
    topics = []
    
    for token in most_common:
        topics.append(token[0])
        
    return str(topics)[1:-1].replace("'", "")
